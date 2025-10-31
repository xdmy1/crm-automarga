// Supabase Configuration - Now using environment variables
let supabase = null;
let SUPABASE_CONFIG = null;

// Initialize Supabase with environment configuration
async function initializeSupabase() {
    try {
        // Wait for environment to load
        const env = await window.EnvConfig.init();
        
        // Get Supabase configuration from environment
        SUPABASE_CONFIG = window.EnvConfig.getSupabaseConfig();
        
        // Fallback to hardcoded values if environment fails (for development)
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
            console.warn('Environment variables not found, using fallback configuration');
            SUPABASE_CONFIG = {
                url: 'https://aoqddcuzmozefdxwweun.supabase.co',
                key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvcWRkY3V6bW96ZWZkeHd3ZXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzODMxMTEsImV4cCI6MjA3Njk1OTExMX0.GqR7gy4DBBEv0mV9FTID81QvVDom_TgJaOKJnn4kz9U'
            };
        }
        
        // Initialize Supabase client
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        
        // Export pentru utilizare în alte module
        window.supabaseClient = supabase;
        
        console.log('Supabase initialized successfully');
        console.log('Using URL:', SUPABASE_CONFIG.url.substring(0, 30) + '...');
        
        return supabase;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        throw error;
    }
}

// Initial export (will be set properly after initialization)
window.supabaseClient = null;

// Helper functions pentru operațiuni comune
window.db = {
    // Lucrări
    lucrari: {
        async getAll() {
            const { data, error } = await supabase
                .from('lucrari')
                .select(`
                    *,
                    clienti:client_id (id, nume, telefon, email),
                    mecanici:mecanic_id (id, nume)
                `)
                .order('data_intrare', { ascending: false });
            
            if (error) throw error;
            return data;
        },

        async getById(id) {
            const { data, error } = await supabase
                .from('lucrari')
                .select(`
                    *,
                    clienti:client_id (id, nume, telefon, email),
                    mecanici:mecanic_id (id, nume)
                `)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        },

        async create(lucrare) {
            const { data, error } = await supabase
                .from('lucrari')
                .insert([lucrare])
                .select();
            
            if (error) throw error;
            return data[0];
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('lucrari')
                .update(updates)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        },

        async delete(id) {
            const { error } = await supabase
                .from('lucrari')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        },

        async getByStatus(status) {
            const { data, error } = await supabase
                .from('lucrari')
                .select('*')
                .eq('stare', status);
            
            if (error) throw error;
            return data;
        },

        async search(query) {
            const { data, error } = await supabase
                .from('lucrari')
                .select(`
                    *,
                    clienti:client_id (id, nume, telefon, email)
                `)
                .or(`numar_lucrare.ilike.%${query}%,nr_inmatriculare.ilike.%${query}%,marca.ilike.%${query}%,model.ilike.%${query}%,descriere.ilike.%${query}%`);
            
            if (error) throw error;
            return data;
        },

        async getDetails(id) {
            const { data, error } = await supabase
                .from('lucrari')
                .select(`
                    *,
                    clienti:client_id (id, nume, telefon, email)
                `)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        }
    },

    // Clienți
    clienti: {
        async getAll() {
            const { data, error } = await supabase
                .from('clienti')
                .select('*')
                .order('nume');
            
            if (error) throw error;
            return data;
        },

        async getById(id) {
            const { data, error } = await supabase
                .from('clienti')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        },

        async create(client) {
            const { data, error } = await supabase
                .from('clienti')
                .insert([client])
                .select();
            
            if (error) throw error;
            return data[0];
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('clienti')
                .update(updates)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        },

        async delete(id) {
            const { error } = await supabase
                .from('clienti')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        },

        async search(query) {
            const { data, error } = await supabase
                .from('clienti')
                .select('*')
                .or(`nume.ilike.%${query}%,telefon.ilike.%${query}%,email.ilike.%${query}%`);
            
            if (error) throw error;
            return data;
        }
    },


    // Mecanici
    mecanici: {
        async getAll() {
            const { data, error } = await supabase
                .from('mecanici')
                .select('*')
                .order('nume');
            
            if (error) throw error;
            return data;
        },

        async getActive() {
            const { data, error } = await supabase
                .from('mecanici')
                .select('*')
                .eq('activ', true)
                .order('nume');
            
            if (error) throw error;
            return data;
        },

        async create(mecanic) {
            const { data, error } = await supabase
                .from('mecanici')
                .insert([mecanic])
                .select();
            
            if (error) throw error;
            return data[0];
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('mecanici')
                .update(updates)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        }
    },

    // Statistici
    stats: {
        async getRevenue(startDate, endDate) {
            const { data, error } = await supabase
                .from('lucrari')
                .select('total_cost')
                .gte('data_finalizare', startDate)
                .lte('data_finalizare', endDate)
                .eq('stare', 'finalizat');
            
            if (error) throw error;
            return data.reduce((sum, item) => sum + (item.total_cost || 0), 0);
        },

        async getMonthlyStats() {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            
            const { data, error } = await supabase
                .from('lucrari')
                .select('*')
                .gte('data_intrare', startOfMonth.toISOString());
            
            if (error) throw error;
            return data;
        },

        async getRepairTypes() {
            const { data, error } = await supabase
                .from('lucrari')
                .select('categorie')
                .not('categorie', 'is', null);
            
            if (error) throw error;
            
            // Grupează după categorie
            const counts = {};
            data.forEach(item => {
                counts[item.categorie] = (counts[item.categorie] || 0) + 1;
            });
            
            return counts;
        }
    },

    // Servicii lucrări (multi-service system)
    servicii: {
        async getAllByLucrareId(lucrareId) {
            const { data, error } = await supabase
                .from('lucrari_servicii')
                .select('*')
                .eq('lucrare_id', lucrareId)
                .order('ordine');
            
            if (error) throw error;
            return data;
        },

        async create(serviciu) {
            const { data, error } = await supabase
                .from('lucrari_servicii')
                .insert([serviciu])
                .select();
            
            if (error) throw error;
            return data[0];
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('lucrari_servicii')
                .update(updates)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        },

        async delete(id) {
            const { error } = await supabase
                .from('lucrari_servicii')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        },

        async updateOrder(servicii) {
            // Update the order of multiple services
            const updates = servicii.map(serviciu => 
                supabase
                    .from('lucrari_servicii')
                    .update({ ordine: serviciu.ordine })
                    .eq('id', serviciu.id)
            );
            
            const results = await Promise.all(updates);
            const errors = results.filter(result => result.error);
            
            if (errors.length > 0) {
                throw errors[0].error;
            }
            
            return true;
        }
    }
};

// Funcții de utilitate pentru erori
window.handleSupabaseError = (error) => {
    console.error('Supabase error:', error);
    
    if (error.message.includes('JWT')) {
        return 'Sesiunea a expirat. Te rugăm să te autentifici din nou.';
    }
    
    if (error.message.includes('network')) {
        return 'Problemă de conexiune. Verifică internetul.';
    }
    
    if (error.message.includes('permission')) {
        return 'Nu ai permisiuni suficiente pentru această acțiune.';
    }
    
    return error.message || 'A apărut o eroare neașteptată.';
};

// Verifică conexiunea la Supabase
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('lucrari')
            .select('count')
            .limit(1);
        
        if (error && error.message.includes('relation "lucrari" does not exist')) {
            console.warn('Tabelele Supabase nu sunt încă create. Vezi README pentru instrucțiuni de setup.');
            return false;
        }
        
        console.log('Supabase connection successful');
        return true;
    } catch (error) {
        console.error('Supabase connection failed:', error);
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeSupabase();
        await testSupabaseConnection();
        console.log('Supabase setup completed successfully');
        
        // Dispatch custom event to notify other modules that Supabase is ready
        window.dispatchEvent(new CustomEvent('supabaseReady'));
    } catch (error) {
        console.error('Failed to setup Supabase:', error);
    }
});