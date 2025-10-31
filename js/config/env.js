// Environment Configuration Loader
window.EnvConfig = {
    // Default fallback values (should be overridden by .env.local)
    defaults: {
        SUPABASE_URL: '',
        SUPABASE_ANON_KEY: ''
    },
    
    // Loaded environment variables
    env: {},
    
    // Initialize and load environment variables
    async init() {
        try {
            // Try to load from .env.local first, then .env
            await this.loadEnvFile('.env.local') || await this.loadEnvFile('.env');
            
            // Merge with defaults
            this.env = { ...this.defaults, ...this.env };
            
            console.log('Environment loaded successfully');
            console.log('Supabase URL configured:', !!this.env.SUPABASE_URL);
            console.log('Supabase Key configured:', !!this.env.SUPABASE_ANON_KEY);
            
            return this.env;
        } catch (error) {
            console.error('Error loading environment:', error);
            console.warn('Using fallback configuration from supabase.js');
            return this.defaults;
        }
    },
    
    // Load environment file
    async loadEnvFile(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                console.log(`${filename} not found, trying next option...`);
                return false;
            }
            
            const text = await response.text();
            this.parseEnvText(text);
            console.log(`Environment loaded from ${filename}`);
            return true;
        } catch (error) {
            console.log(`Could not load ${filename}:`, error.message);
            return false;
        }
    },
    
    // Parse environment text content
    parseEnvText(text) {
        const lines = text.split('\n');
        for (const line of lines) {
            // Skip comments and empty lines
            if (line.trim() === '' || line.trim().startsWith('#')) {
                continue;
            }
            
            // Parse KEY=VALUE pairs
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                this.env[key.trim()] = value;
            }
        }
    },
    
    // Get environment variable
    get(key, defaultValue = null) {
        return this.env[key] || defaultValue;
    },
    
    // Check if environment is loaded
    isLoaded() {
        return Object.keys(this.env).length > 0;
    },
    
    // Get Supabase configuration
    getSupabaseConfig() {
        return {
            url: this.get('SUPABASE_URL'),
            key: this.get('SUPABASE_ANON_KEY')
        };
    }
};