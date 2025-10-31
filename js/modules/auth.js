// Modulul de autentificare prin PIN
window.AuthModule = {
    currentUser: null,
    isInitialized: false,
    sessionTimeout: 30 * 60 * 1000, // 30 minute în milisecunde
    sessionTimer: null,

    // Inițializează modulul de autentificare
    init() {
        if (this.isInitialized) return;

        console.log('Auth module starting initialization...');
        
        // Event listeners
        this.setupEventListeners();
        
        // Verifică dacă există o sesiune activă
        this.checkExistingSession();

        this.isInitialized = true;
        console.log('Auth module initialized');
    },

    // Configurează event listeners
    setupEventListeners() {
        console.log('Setting up auth event listeners...');
        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        console.log('DOM elements found:', {
            loginForm: !!loginForm,
            logoutBtn: !!logoutBtn,
            userMenuBtn: !!userMenuBtn,
            userDropdown: !!userDropdown
        });

        // Login form
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // User menu dropdown
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdown.classList.add('hidden');
            });
        }

        // Session activity tracking
        this.setupSessionTracking();
    },

    // Configurează tracking pentru activitatea sesiunii
    setupSessionTracking() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.resetSessionTimer();
            }, { passive: true });
        });
    },

    // Verifică dacă există o sesiune activă
    checkExistingSession() {
        console.log('Checking existing session...');
        const session = StorageModule.loadFromLocalStorage('admin_session');
        
        if (session && session.expiresAt > Date.now()) {
            console.log('Valid session found, showing main app');
            this.currentUser = session.user;
            this.showMainApp();
            this.resetSessionTimer();
        } else {
            console.log('No valid session, showing login screen');
            // Șterge sesiunea expirată
            StorageModule.removeFromLocalStorage('admin_session');
            this.showLoginScreen();
        }
    },

    // Afișează aplicația principală
    showMainApp() {
        console.log('Showing main app...');
        const loading = document.getElementById('loading');
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        console.log('Main app elements:', {
            loading: !!loading,
            loginScreen: !!loginScreen,
            mainApp: !!mainApp
        });
        
        if (loading) loading.classList.add('hidden');
        if (loginScreen) loginScreen.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        // Actualizează informațiile utilizatorului
        this.updateUserInfo();
        
        // Inițializează alte module
        if (window.DashboardModule) {
            window.DashboardModule.init();
        }
        if (window.LucrariModule) {
            window.LucrariModule.init();
        }
        if (window.ClientiModule) {
            window.ClientiModule.init();
        }
        if (window.PieseModule) {
            window.PieseModule.init();
        }
    },

    // Afișează ecranul de login
    showLoginScreen() {
        console.log('Showing login screen...');
        const loading = document.getElementById('loading');
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        console.log('Login screen elements:', {
            loading: !!loading,
            loginScreen: !!loginScreen,
            mainApp: !!mainApp
        });
        
        if (loading) loading.classList.add('hidden');
        if (mainApp) mainApp.classList.add('hidden');
        if (loginScreen) loginScreen.classList.remove('hidden');
        
        // Curăță sesiunea
        this.currentUser = null;
        this.clearSessionTimer();
    },

    // Actualizează informațiile utilizatorului în UI
    updateUserInfo() {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.currentUser.nume || 'Administrator';
        }
    },

    // Gestionează login-ul prin PIN
    async handleLogin() {
        const pinInput = document.getElementById('admin-pin');
        const pin = pinInput.value.trim();

        if (!pin) {
            NotificationModule.show('Te rugăm să introduci PIN-ul', 'warning');
            return;
        }

        if (pin.length < 4 || pin.length > 8) {
            NotificationModule.show('PIN-ul trebuie să aibă între 4 și 8 cifre', 'warning');
            return;
        }

        try {
            // Afișează loading
            this.showLoginLoading(true);
            
            // Verifică PIN-ul
            const isValidPin = await this.validatePin(pin);
            
            if (isValidPin) {
                // Creează sesiunea
                this.createSession();
                
                NotificationModule.show('Acces autorizat cu succes!', 'success');
                
                // Curăță PIN-ul din input
                pinInput.value = '';
                
            } else {
                NotificationModule.show('PIN incorect. Încearcă din nou.', 'error');
                
                // Adaugă o încercare de login eșuată
                this.logFailedAttempt();
            }
            
        } catch (error) {
            console.error('Login error:', error);
            NotificationModule.show('Eroare la autentificare', 'error');
        } finally {
            this.showLoginLoading(false);
        }
    },

    // Validează PIN-ul folosind funcția Supabase securizată
    async validatePin(pin) {
        try {
            if (!window.supabaseClient) {
                console.error('Supabase not available - PIN authentication disabled');
                return false;
            }

            // Folosește funcția verify_admin_pin din Supabase
            const { data, error } = await window.supabaseClient
                .rpc('verify_admin_pin', { input_pin: pin });

            if (error) {
                console.error('Error calling verify_admin_pin:', error);
                return false;
            }

            return data === true;
        } catch (error) {
            console.error('Error validating PIN:', error);
            return false;
        }
    },

    // Creează o sesiune nouă
    createSession() {
        const user = {
            id: 'admin',
            nume: 'Administrator',
            rol: 'admin',
            loginTime: new Date()
        };

        const session = {
            user,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.sessionTimeout
        };

        // Salvează sesiunea
        StorageModule.saveToLocalStorage('admin_session', session);
        
        this.currentUser = user;
        this.showMainApp();
        this.resetSessionTimer();
    },

    // Resetează timer-ul sesiunii
    resetSessionTimer() {
        this.clearSessionTimer();
        
        this.sessionTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);

        // Actualizează timpul de expirare în storage
        const session = StorageModule.loadFromLocalStorage('admin_session');
        if (session) {
            session.expiresAt = Date.now() + this.sessionTimeout;
            StorageModule.saveToLocalStorage('admin_session', session);
        }
    },

    // Curăță timer-ul sesiunii
    clearSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    },

    // Gestionează expirarea sesiunii
    handleSessionTimeout() {
        NotificationModule.show('Sesiunea a expirat din cauza inactivității', 'warning');
        this.handleLogout();
    },

    // Gestionează logout-ul
    handleLogout() {
        try {
            // Șterge sesiunea
            StorageModule.removeFromLocalStorage('admin_session');
            
            // Curăță cache-ul
            StorageModule.clearCache();
            
            // Curăță timer-ul
            this.clearSessionTimer();
            
            // Afișează ecranul de login
            this.showLoginScreen();
            
            NotificationModule.show('Te-ai deconectat cu succes', 'success');
            
        } catch (error) {
            console.error('Logout error:', error);
            NotificationModule.show('Eroare la deconectare', 'error');
        }
    },

    // Afișează/ascunde loading pentru login
    showLoginLoading(show) {
        const loginForm = document.getElementById('login-form');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        if (show) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Verifică PIN-ul...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Acces Admin';
        }
    },

    // Înregistrează o încercare de login eșuată
    logFailedAttempt() {
        const attempts = StorageModule.loadFromLocalStorage('failed_attempts') || [];
        attempts.push({
            timestamp: Date.now(),
            ip: 'unknown' // În o aplicație reală, ai obține IP-ul real
        });

        // Păstrează doar ultimele 10 încercări
        if (attempts.length > 10) {
            attempts.splice(0, attempts.length - 10);
        }

        StorageModule.saveToLocalStorage('failed_attempts', attempts);

        // Verifică dacă sunt prea multe încercări recente
        const recentAttempts = attempts.filter(attempt => 
            Date.now() - attempt.timestamp < 1 * 60 * 1000 // ultimele 15 minute
        );

        if (recentAttempts.length >= 5) {
            NotificationModule.show('Prea multe încercări eșuate. Încearcă din nou în 15 minute.', 'error');
            
            // Blochează temporar login-ul
            this.blockLogin(1 * 60 * 1000); // 15 minute
        }
    },

    // Blochează temporar login-ul
    blockLogin(duration) {
        const loginForm = document.getElementById('login-form');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const pinInput = document.getElementById('admin-pin');

        submitBtn.disabled = true;
        pinInput.disabled = true;

        setTimeout(() => {
            submitBtn.disabled = false;
            pinInput.disabled = false;
        }, duration);
    },

    // Schimbă PIN-ul admin folosind funcția securizată
    async changePin(currentPin, newPin) {
        try {
            // Validează noul PIN
            if (!newPin || newPin.length < 4 || newPin.length > 8) {
                throw new Error('Noul PIN trebuie să aibă între 4 și 8 cifre');
            }

            if (!/^\d+$/.test(newPin)) {
                throw new Error('PIN-ul poate conține doar cifre');
            }

            if (!window.supabaseClient) {
                throw new Error('Supabase nu este disponibil');
            }

            // Folosește funcția update_admin_pin din Supabase
            const { data, error } = await window.supabaseClient
                .rpc('update_admin_pin', { 
                    old_pin: currentPin, 
                    new_pin: newPin 
                });

            if (error) {
                throw error;
            }

            if (data === false) {
                throw new Error('PIN-ul curent este incorect');
            }

            NotificationModule.show('PIN-ul a fost schimbat cu succes', 'success');
            return true;

        } catch (error) {
            console.error('Error changing PIN:', error);
            NotificationModule.show(error.message || 'Eroare la schimbarea PIN-ului', 'error');
            return false;
        }
    },

    // Verifică dacă utilizatorul este autentificat
    isAuthenticated() {
        return this.currentUser !== null;
    },

    // Obține utilizatorul curent
    getCurrentUser() {
        return this.currentUser;
    },

    // Verifică dacă utilizatorul este admin (întotdeauna true în acest caz)
    isAdmin() {
        return this.isAuthenticated();
    },

    // Afișează modal pentru schimbarea PIN-ului
    showChangePinModal() {
        const modalHTML = `
            <div class="modal bg-white rounded-lg shadow-xlw-full  p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Schimbă PIN Admin</h2>
                    <button id="close-pin-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="change-pin-form" class="space-y-4">
                    <div>
                        <label for="current-pin" class="block text-sm font-medium text-gray-700">PIN curent</label>
                        <input type="password" id="current-pin" required maxlength="8"
                               class="form-input mt-1 text-center">
                    </div>
                    
                    <div>
                        <label for="new-pin" class="block text-sm font-medium text-gray-700">PIN nou</label>
                        <input type="password" id="new-pin" required maxlength="8" minlength="4"
                               class="form-input mt-1 text-center">
                    </div>
                    
                    <div>
                        <label for="confirm-pin" class="block text-sm font-medium text-gray-700">Confirmă PIN nou</label>
                        <input type="password" id="confirm-pin" required maxlength="8"
                               class="form-input mt-1 text-center">
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancel-pin-change" class="btn-secondary">
                            Anulează
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-key mr-2"></i>
                            Schimbă PIN
                        </button>
                    </div>
                </form>
            </div>
        `;

        ModalModule.show(modalHTML);

        // Event listeners pentru modal
        document.getElementById('close-pin-modal').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('cancel-pin-change').addEventListener('click', () => {
            ModalModule.hide();
        });

        document.getElementById('change-pin-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPin = document.getElementById('current-pin').value;
            const newPin = document.getElementById('new-pin').value;
            const confirmPin = document.getElementById('confirm-pin').value;

            if (newPin !== confirmPin) {
                NotificationModule.show('PIN-urile nu coincid', 'warning');
                return;
            }

            const success = await this.changePin(currentPin, newPin);
            if (success) {
                ModalModule.hide();
            }
        });
    }
};

// Wait for Supabase to be ready before initializing auth
window.addEventListener('supabaseReady', () => {
    console.log('Supabase ready, initializing auth module...');
    window.AuthModule.init();
});

// Fallback initialization
document.addEventListener('DOMContentLoaded', () => {
    // Fallback if Supabase doesn't initialize
    setTimeout(() => {
        if (!window.AuthModule.isInitialized) {
            console.warn('Initializing auth module without Supabase');
            window.AuthModule.init();
        }
    }, 3000);
});