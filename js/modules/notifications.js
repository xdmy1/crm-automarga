// Modulul pentru notificări toast
window.NotificationModule = {
    container: null,
    notifications: [],

    // Inițializează modulul
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            console.error('Toast container not found');
        }
    },

    // Afișează o notificare
    show(message, type = 'info', duration = 5000) {
        if (!this.container) {
            this.init();
        }

        const id = window.helpers ? helpers.generateId() : Date.now().toString(36) + Math.random().toString(36).substr(2);
        const notification = this.createNotification(id, message, type, duration);
        
        this.notifications.push({
            id,
            element: notification,
            timer: null
        });

        this.container.appendChild(notification);

        // Animație de intrare
        setTimeout(() => {
            notification.classList.add('translate-x-0');
            notification.classList.remove('translate-x-full');
        }, 10);

        // Auto-remove după durata specificată
        if (duration > 0) {
            const timer = setTimeout(() => {
                this.remove(id);
            }, duration);

            const notifObj = this.notifications.find(n => n.id === id);
            if (notifObj) {
                notifObj.timer = timer;
            }
        }

        return id;
    },

    // Creează elementul de notificare
    createNotification(id, message, type, duration) {
        const notification = document.createElement('div');
        notification.id = `toast-${id}`;
        notification.className = `toast relative flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg border transform translate-x-full transition-transform duration-300 ease-out`;

        // Stilizează în funcție de tip
        const typeConfig = this.getTypeConfig(type);
        notification.classList.add(...typeConfig.classes);

        notification.innerHTML = `
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${typeConfig.iconBg}">
                <i class="${typeConfig.icon} ${typeConfig.iconColor}"></i>
            </div>
            <div class="ml-3 text-sm font-normal flex-1">
                ${window.helpers ? helpers.escapeHtml(message) : message}
            </div>
            <button type="button" class="toast-close ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300" data-id="${id}">
                <span class="sr-only">Închide</span>
                <i class="fas fa-times text-xs"></i>
            </button>
        `;

        // Progress bar pentru timeout
        if (duration > 0) {
            const progressBar = document.createElement('div');
            progressBar.className = 'absolute bottom-0 left-0 h-1 bg-gray-300 rounded-b-lg overflow-hidden';
            progressBar.style.width = '100%';
            
            const progress = document.createElement('div');
            progress.className = `h-full ${typeConfig.progressColor}`;
            progress.style.width = '100%';
            progress.style.animation = `toast-progress ${duration}ms linear`;
            
            progressBar.appendChild(progress);
            notification.appendChild(progressBar);
        }

        // Event listener pentru butonul de închidere
        const closeBtn = notification.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(id);
        });

        // Auto-pause pe hover
        notification.addEventListener('mouseenter', () => {
            const notifObj = this.notifications.find(n => n.id === id);
            if (notifObj && notifObj.timer) {
                clearTimeout(notifObj.timer);
                notifObj.timer = null;
            }
        });

        notification.addEventListener('mouseleave', () => {
            if (duration > 0) {
                const timer = setTimeout(() => {
                    this.remove(id);
                }, 2000); // 2 secunde după ce mouse-ul iese

                const notifObj = this.notifications.find(n => n.id === id);
                if (notifObj) {
                    notifObj.timer = timer;
                }
            }
        });

        return notification;
    },

    // Obține configurația pentru tipul de notificare
    getTypeConfig(type) {
        const configs = {
            success: {
                classes: ['border-green-200', 'text-green-800'],
                icon: 'fas fa-check-circle',
                iconBg: 'bg-green-100',
                iconColor: 'text-green-500',
                progressColor: 'bg-green-500'
            },
            error: {
                classes: ['border-red-200', 'text-red-800'],
                icon: 'fas fa-exclamation-circle',
                iconBg: 'bg-red-100',
                iconColor: 'text-red-500',
                progressColor: 'bg-red-500'
            },
            warning: {
                classes: ['border-yellow-200', 'text-yellow-800'],
                icon: 'fas fa-exclamation-triangle',
                iconBg: 'bg-yellow-100',
                iconColor: 'text-yellow-500',
                progressColor: 'bg-yellow-500'
            },
            info: {
                classes: ['border-blue-200', 'text-blue-800'],
                icon: 'fas fa-info-circle',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-500',
                progressColor: 'bg-blue-500'
            }
        };

        return configs[type] || configs.info;
    },

    // Elimină o notificare
    remove(id) {
        const notifObj = this.notifications.find(n => n.id === id);
        if (!notifObj) return;

        // Clear timer dacă există
        if (notifObj.timer) {
            clearTimeout(notifObj.timer);
        }

        // Animație de ieșire
        notifObj.element.classList.add('removing', 'translate-x-full');
        
        setTimeout(() => {
            if (notifObj.element.parentNode) {
                notifObj.element.parentNode.removeChild(notifObj.element);
            }
            
            // Elimină din array
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, 300);
    },

    // Elimină toate notificările
    removeAll() {
        this.notifications.forEach(notif => {
            this.remove(notif.id);
        });
    },

    // Shorthand methods pentru tipurile comune
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    },

    error(message, duration = 7000) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    },

    // Afișează notificare de confirmare cu acțiuni
    confirm(message, onConfirm, onCancel = null) {
        const id = window.helpers ? helpers.generateId() : Date.now().toString(36) + Math.random().toString(36).substr(2);
        const notification = document.createElement('div');
        notification.id = `toast-${id}`;
        notification.className = `toast relative flex flex-col w-full max-w-sm p-4 mb-4 text-gray-700 bg-white rounded-lg shadow-lg border border-gray-200 transform translate-x-full transition-transform duration-300 ease-out`;

        notification.innerHTML = `
            <div class="flex items-start mb-3">
                <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-100">
                    <i class="fas fa-question-circle text-yellow-500"></i>
                </div>
                <div class="ml-3 text-sm font-normal">
                    ${window.helpers ? helpers.escapeHtml(message) : message}
                </div>
            </div>
            <div class="flex space-x-2">
                <button type="button" class="confirm-yes text-xs bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700 transition-colors">
                    Da
                </button>
                <button type="button" class="confirm-no text-xs bg-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-400 transition-colors">
                    Nu
                </button>
            </div>
        `;

        this.container.appendChild(notification);

        // Animație de intrare
        setTimeout(() => {
            notification.classList.add('translate-x-0');
            notification.classList.remove('translate-x-full');
        }, 10);

        // Event listeners
        const yesBtn = notification.querySelector('.confirm-yes');
        const noBtn = notification.querySelector('.confirm-no');

        yesBtn.addEventListener('click', () => {
            this.removeElement(notification);
            if (onConfirm) onConfirm();
        });

        noBtn.addEventListener('click', () => {
            this.removeElement(notification);
            if (onCancel) onCancel();
        });

        return id;
    },

    // Elimină un element specific
    removeElement(element) {
        element.classList.add('removing', 'translate-x-full');
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
};

// Inițializează modulul când se încarcă DOM-ul
document.addEventListener('DOMContentLoaded', () => {
    window.NotificationModule.init();
});

// Adaugă stilurile CSS pentru animația progress bar
const style = document.createElement('style');
style.textContent = `
    @keyframes toast-progress {
        from {
            width: 100%;
        }
        to {
            width: 0%;
        }
    }
`;
document.head.appendChild(style);