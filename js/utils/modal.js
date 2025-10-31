// Modulul pentru gestionarea modal-urilor
window.ModalModule = {
    container: null,
    currentModal: null,
    isInitialized: false,

    // Inițializează modulul
    init() {
        console.log('ModalModule.init called');
        if (this.isInitialized) {
            console.log('ModalModule already initialized');
            return;
        }

        this.container = document.getElementById('modal-container');
        console.log('Modal container found:', !!this.container);
        if (!this.container) {
            console.error('Modal container not found');
            return;
        }

        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Modal module initialized');
    },

    // Configurează event listeners
    setupEventListeners() {
        // Închide modal la click pe overlay
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.hide();
            }
        });

        // Închide modal la ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.hide();
            }
        });
    },

    // Afișează un modal
    show(content, options = {}) {
        console.log('ModalModule.show called');
        console.log('Container exists:', !!this.container);
        
        if (!this.container) {
            console.log('Container not found, initializing...');
            this.init();
        }

        const config = {
            closable: true,
            size: 'md',
            animation: true,
            backdrop: true,
            ...options
        };

        // Creează modal-ul
        this.currentModal = this.createModal(content, config);
        
        // Golește container-ul și adaugă noul modal
        this.container.innerHTML = '';
        this.container.appendChild(this.currentModal);
        
        // Afișează container-ul
        console.log('Showing modal container...');
        this.container.classList.remove('hidden');
        console.log('Container visible:', !this.container.classList.contains('hidden'));
        
        // Previne scroll pe body
        document.body.style.overflow = 'hidden';
        
        // Animație de intrare
        if (config.animation) {
            setTimeout(() => {
                this.currentModal.classList.add('scale-100', 'opacity-100');
                this.currentModal.classList.remove('scale-95', 'opacity-0');
            }, 10);
        }

        // Focus pe primul element focusabil
        this.focusFirstElement();

        return this.currentModal;
    },

    // Creează elementul modal
    createModal(content, config) {
        const modal = document.createElement('div');
        modal.className = `fixed inset-0 z-50 flex items-center justify-center p-4 ${config.animation ? 'transform scale-95 opacity-0 transition-all duration-300' : ''}`;
        
        // Backdrop
        if (config.backdrop) {
            const backdrop = document.createElement('div');
            backdrop.className = 'absolute inset-0 bg-black bg-opacity-50';
            modal.appendChild(backdrop);
        }

        // Modal content container
        const contentContainer = document.createElement('div');
        contentContainer.className = `relative z-10 w-full max-h-full overflow-auto ${this.getSizeClasses(config.size)}`;
        
        if (typeof content === 'string') {
            contentContainer.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentContainer.appendChild(content);
        }

        modal.appendChild(contentContainer);

        return modal;
    },

    // Obține clasele pentru dimensiune
    getSizeClasses(size) {
        const sizes = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
            '2xl': 'max-w-2xl',
            '3xl': 'max-w-3xl',
            '4xl': 'max-w-4xl',
            '5xl': 'max-w-5xl',
            '6xl': 'max-w-6xl',
            full: 'max-w-full'
        };
        
        return sizes[size] || sizes.md;
    },

    // Ascunde modal-ul
    hide(callback = null) {
        if (!this.currentModal) return;

        // Animație de ieșire
        this.currentModal.classList.add('scale-95', 'opacity-0');
        this.currentModal.classList.remove('scale-100', 'opacity-100');

        setTimeout(() => {
            this.container.classList.add('hidden');
            this.container.innerHTML = '';
            this.currentModal = null;
            
            // Restabilește scroll pe body
            document.body.style.overflow = '';
            
            if (callback) callback();
        }, 300);
    },

    // Focusează primul element focusabil
    focusFirstElement() {
        if (!this.currentModal) return;

        const focusableElements = this.currentModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    },

    // Afișează modal de confirmare
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const config = {
                title: 'Confirmă acțiunea',
                confirmText: 'Da',
                cancelText: 'Nu',
                confirmClass: 'btn-danger',
                cancelClass: 'btn-secondary',
                ...options
            };

            const modalContent = `
                <div class="bg-white rounded-lg shadow-xl w-full p-6">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-medium text-gray-900">${config.title}</h3>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <p class="text-sm text-gray-500">${window.helpers ? helpers.escapeHtml(message) : message}</p>
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button type="button" id="modal-cancel" class="${config.cancelClass}">
                            ${config.cancelText}
                        </button>
                        <button type="button" id="modal-confirm" class="${config.confirmClass}">
                            ${config.confirmText}
                        </button>
                    </div>
                </div>
            `;

            this.show(modalContent, { closable: false });

            // Event listeners
            document.getElementById('modal-confirm').addEventListener('click', () => {
                this.hide(() => resolve(true));
            });

            document.getElementById('modal-cancel').addEventListener('click', () => {
                this.hide(() => resolve(false));
            });
        });
    },

    // Afișează modal de alertă
    alert(message, options = {}) {
        return new Promise((resolve) => {
            const config = {
                title: 'Informație',
                buttonText: 'OK',
                buttonClass: 'btn-primary',
                icon: 'fas fa-info-circle',
                iconColor: 'text-blue-600',
                iconBg: 'bg-blue-100',
                ...options
            };

            const modalContent = `
                <div class="bg-white rounded-lg shadow-xl w-full p-6">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center">
                            <i class="${config.icon} ${config.iconColor}"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-medium text-gray-900">${config.title}</h3>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <p class="text-sm text-gray-500">${window.helpers ? helpers.escapeHtml(message) : message}</p>
                    </div>
                    
                    <div class="flex justify-end">
                        <button type="button" id="modal-ok" class="${config.buttonClass}">
                            ${config.buttonText}
                        </button>
                    </div>
                </div>
            `;

            this.show(modalContent, { closable: false });

            document.getElementById('modal-ok').addEventListener('click', () => {
                this.hide(() => resolve(true));
            });
        });
    },

    // Afișează modal de loading
    showLoading(message = 'Se încarcă...') {
        const modalContent = `
            <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center">
                <div class="mb-4">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                </div>
                <p class="text-gray-600">${window.helpers ? helpers.escapeHtml(message) : message}</p>
            </div>
        `;

        return this.show(modalContent, { closable: false, backdrop: true });
    },

    // Verifică dacă un modal este deschis
    isOpen() {
        return this.currentModal !== null;
    },

    // Actualizează conținutul modal-ului curent
    updateContent(content) {
        if (!this.currentModal) return;

        const contentContainer = this.currentModal.querySelector('[class*="max-w-"]');
        if (contentContainer) {
            if (typeof content === 'string') {
                contentContainer.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                contentContainer.innerHTML = '';
                contentContainer.appendChild(content);
            }
        }
    }
};

// Inițializează modulul când se încarcă DOM-ul
document.addEventListener('DOMContentLoaded', () => {
    window.ModalModule.init();
});