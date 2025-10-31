// Aplicația principală AutoMarga CRM
window.AutoMargaApp = {
    isInitialized: false,
    currentSection: 'dashboard',

    // Inițializează aplicația
    init() {
        if (this.isInitialized) return;

        console.log('Initializing AutoMarga CRM App...');

        // Configurează event listeners globali
        this.setupGlobalEventListeners();
        
        // Configurează navigația
        this.setupNavigation();
        
        // Configurează gestionarea erorilor globale
        this.setupErrorHandling();
        
        // Inițializează toate modulele
        this.initializeModules();

        this.isInitialized = true;
        console.log('AutoMarga CRM App initialized successfully');
    },

    // Configurează event listeners globali
    setupGlobalEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileNav = document.getElementById('mobile-nav');
        const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

        if (mobileMenuBtn && mobileNav && mobileNavOverlay) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileNav();
            });

            mobileNavOverlay.addEventListener('click', () => {
                this.closeMobileNav();
            });
            
            // Close mobile nav when clicking on nav items
            const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
            mobileNavItems.forEach(item => {
                item.addEventListener('click', () => {
                    this.closeMobileNav();
                });
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle resize pentru responsive
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Previne refresh accidental
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },

    // Configurează navigația
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Back/forward browser navigation
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.navigateToSection(e.state.section, false);
            }
        });
    },

    // Navighează la o secțiune
    navigateToSection(section, updateHistory = true) {
        if (section === this.currentSection) return;

        // Verifică dacă există modificări nesalvate
        if (this.hasUnsavedChanges()) {
            const confirmed = confirm(CONSTANTS.MESSAGES.WARNING.DATE_NESALVATE);
            if (!confirmed) return;
        }

        // Actualizează starea activă în navigație
        this.updateNavigationState(section);

        // Afișează secțiunea
        this.showSection(section);

        // Actualizează istoricul browserului
        if (updateHistory) {
            history.pushState({ section }, '', `#${section}`);
        }

        this.currentSection = section;
    },

    // Actualizează starea navigației
    updateNavigationState(activeSection) {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const section = item.dataset.section;
            if (section === activeSection) {
                item.classList.add('text-primary-600', 'bg-primary-50');
                item.classList.remove('text-gray-700');
            } else {
                item.classList.remove('text-primary-600', 'bg-primary-50');
                item.classList.add('text-gray-700');
            }
        });
    },

    // Afișează o secțiune
    showSection(section) {
        // Ascunde toate secțiunile
        const sections = document.querySelectorAll('.section-content');
        sections.forEach(s => s.classList.add('hidden'));

        // Afișează secțiunea solicitată
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Inițializează modulul specific pentru secțiune
        this.initializeSectionModule(section);
    },

    // Inițializează modulul pentru o secțiune specifică
    initializeSectionModule(section) {
        switch (section) {
            case 'dashboard':
                if (window.DashboardModule && !window.DashboardModule.isInitialized) {
                    window.DashboardModule.init();
                }
                if (window.DashboardModule && window.DashboardModule.show) {
                    window.DashboardModule.show();
                }
                break;

            case 'lucrari':
                if (window.LucrariModule && window.LucrariModule.show) {
                    window.LucrariModule.show();
                }
                break;

            case 'clienti':
                if (window.ClientiModule && window.ClientiModule.show) {
                    window.ClientiModule.show();
                }
                break;

            case 'piese':
                if (window.PieseModule && window.PieseModule.show) {
                    window.PieseModule.show();
                }
                break;

            case 'mecanici':
                if (window.MecaniciModule && window.MecaniciModule.show) {
                    window.MecaniciModule.show();
                }
                break;

            case 'facturi':
                if (window.FacturiModule && window.FacturiModule.show) {
                    window.FacturiModule.show();
                }
                break;

            default:
                console.warn(`Unknown section: ${section}`);
        }
    },

    // Toggle mobile sidebar
    toggleMobileNav() {
        const mobileNav = document.getElementById('mobile-nav');
        const overlay = document.getElementById('mobile-nav-overlay');

        if (mobileNav && overlay) {
            const isOpen = !mobileNav.classList.contains('hidden');
            
            if (isOpen) {
                this.closeMobileNav();
            } else {
                this.openMobileNav();
            }
        }
    },

    // Deschide mobile navigation
    openMobileNav() {
        const mobileNav = document.getElementById('mobile-nav');
        const overlay = document.getElementById('mobile-nav-overlay');

        if (mobileNav && overlay) {
            mobileNav.classList.remove('hidden');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },

    // Închide mobile navigation
    closeMobileNav() {
        const mobileNav = document.getElementById('mobile-nav');
        const overlay = document.getElementById('mobile-nav-overlay');

        if (mobileNav && overlay) {
            mobileNav.classList.add('hidden');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    // Toggle theme (dark/light mode)
    toggleTheme() {
        const html = document.documentElement;
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');

        if (html.classList.contains('dark')) {
            // Switch to light mode
            html.classList.remove('dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            // Switch to dark mode
            html.classList.add('dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    },

    // Încarcă theme-ul salvat
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const html = document.documentElement;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (savedTheme === 'dark') {
            html.classList.add('dark');
            if (themeToggle) {
                const icon = themeToggle.querySelector('i');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        } else {
            // Default la sistem sau light
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark && !savedTheme) {
                html.classList.add('dark');
                if (themeToggle) {
                    const icon = themeToggle.querySelector('i');
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
            }
        }
    },

    // Gestionează shortcut-urile de tastatură
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K pentru căutare globală
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.showGlobalSearch();
        }

        // Escape pentru închiderea modal-urilor
        if (e.key === 'Escape') {
            if (window.ModalModule && window.ModalModule.isOpen()) {
                window.ModalModule.hide();
            }
        }

        // Alt + numărul secțiunii pentru navigare rapidă
        if (e.altKey && !isNaN(parseInt(e.key))) {
            e.preventDefault();
            const sections = ['dashboard', 'lucrari', 'clienti', 'piese', 'mecanici', 'facturi'];
            const sectionIndex = parseInt(e.key) - 1;
            
            if (sections[sectionIndex]) {
                this.navigateToSection(sections[sectionIndex]);
            }
        }
    },

    // Gestionează resize-ul ferestrei
    handleWindowResize() {
        // Închide sidebar-ul mobil la resize
        if (window.innerWidth >= 1024) { // lg breakpoint
            this.closeMobileNav();
        }
    },

    // Verifică dacă există modificări nesalvate
    hasUnsavedChanges() {
        // Verifică în toate modulele dacă există modificări nesalvate
        const modules = [
            window.LucrariModule,
            window.ClientiModule,
            window.PieseModule
        ];

        return modules.some(module => 
            module && module.hasUnsavedChanges && module.hasUnsavedChanges()
        );
    },

    // Afișează căutarea globală
    showGlobalSearch() {
        // Va fi implementată cu modulul de căutare
        console.log('Global search will be implemented');
        NotificationModule.show('Căutarea globală va fi implementată în curând', 'info');
    },

    // Configurează gestionarea erorilor globale
    setupErrorHandling() {
        // Gestionează erorile JavaScript neprindoe
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            
            // Nu afișa erori în producție
            if (window.location.hostname !== 'localhost') {
                NotificationModule.show('A apărut o eroare neașteptată', 'error');
            } else {
                NotificationModule.show(`Eroare: ${e.error.message}`, 'error');
            }
        });

        // Gestionează promise rejection-urile neprindoe
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            
            if (window.location.hostname !== 'localhost') {
                NotificationModule.show('A apărut o eroare neașteptată', 'error');
            } else {
                NotificationModule.show(`Promise rejection: ${e.reason}`, 'error');
            }
        });
    },

    // Inițializează toate modulele
    initializeModules() {
        console.log('Initializing modules...');
        
        // Lista modulelor în ordinea de inițializare
        const modules = [
            'StorageModule',
            'NotificationModule', 
            'ModalModule',
            'AuthModule',
            'DashboardModule',
            'LucrariModule',
            'ClientiModule',
            'PieseModule'
        ];

        modules.forEach(moduleName => {
            console.log(`Initializing ${moduleName}...`);
            const module = window[moduleName];
            if (module && module.init) {
                try {
                    if (!module.isInitialized) {
                        module.init();
                        console.log(`${moduleName} initialized successfully`);
                    } else {
                        console.log(`${moduleName} already initialized`);
                    }
                } catch (error) {
                    console.error(`Error initializing ${moduleName}:`, error);
                }
            } else {
                console.warn(`Module ${moduleName} not found or missing init method`);
            }
        });
        
        console.log('Module initialization complete');
    },

    // Obține secțiunea curentă din URL
    getCurrentSectionFromURL() {
        const hash = window.location.hash.slice(1);
        const validSections = ['dashboard', 'lucrari', 'clienti', 'piese', 'mecanici', 'facturi'];
        
        return validSections.includes(hash) ? hash : 'dashboard';
    },

    // Setează secțiunea inițială
    setInitialSection() {
        const section = this.getCurrentSectionFromURL();
        this.navigateToSection(section, false);
    }
};

// Wait for Supabase to be ready before initializing the app
window.addEventListener('supabaseReady', () => {
    console.log('Supabase ready, starting app initialization...');
    
    // Încarcă theme-ul salvat
    window.AutoMargaApp.loadSavedTheme();
    console.log('Theme loaded');
    
    // Initialize the app
    window.AutoMargaApp.init();
    
    // Setează secțiunea inițială doar dacă utilizatorul este autentificat
    if (window.AuthModule && window.AuthModule.isAuthenticated()) {
        console.log('User authenticated, setting initial section');
        window.AutoMargaApp.setInitialSection();
    } else {
        console.log('User not authenticated, auth module should handle login');
    }
});

// Fallback if Supabase doesn't initialize within 5 seconds
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, waiting for Supabase...');
    
    setTimeout(() => {
        if (!window.supabaseClient) {
            console.warn('Supabase not ready after 5 seconds, initializing app anyway...');
            window.AutoMargaApp.loadSavedTheme();
            window.AutoMargaApp.init();
            
            if (window.AuthModule && window.AuthModule.isAuthenticated()) {
                window.AutoMargaApp.setInitialSection();
            }
        }
    }, 5000);
});

// Export pentru utilizare în alte module
window.App = window.AutoMargaApp;