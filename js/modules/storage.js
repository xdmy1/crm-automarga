// Modulul pentru gestionarea storage și cache
window.StorageModule = {
    cache: new Map(),
    isOnline: navigator.onLine,

    // Inițializează modulul
    init() {
        this.setupOnlineStatusListeners();
        this.loadCacheFromStorage();
        console.log('Storage module initialized');
    },

    // Configurează listeners pentru statusul de conectare
    setupOnlineStatusListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingChanges();
            if (window.NotificationModule && window.NotificationModule.show) {
                NotificationModule.show('Conexiunea a fost restabilită', 'success');
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            if (window.NotificationModule && window.NotificationModule.show) {
                NotificationModule.show('Aplicația funcționează offline', 'warning');
            }
        });
    },

    // Încarcă cache din localStorage
    loadCacheFromStorage() {
        try {
            const cachedData = localStorage.getItem('automarga_cache');
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                Object.entries(parsed).forEach(([key, value]) => {
                    this.cache.set(key, value);
                });
            }
        } catch (error) {
            console.error('Error loading cache from storage:', error);
        }
    },

    // Salvează cache în localStorage
    saveCacheToStorage() {
        try {
            const cacheObj = {};
            this.cache.forEach((value, key) => {
                cacheObj[key] = value;
            });
            localStorage.setItem('automarga_cache', JSON.stringify(cacheObj));
        } catch (error) {
            console.error('Error saving cache to storage:', error);
        }
    },

    // Setează o valoare în cache
    setCache(key, data, expiry = CONSTANTS.CACHE_DURATION) {
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            expiry: expiry ? Date.now() + expiry : null
        };
        
        this.cache.set(key, cacheEntry);
        this.saveCacheToStorage();
    },

    // Obține o valoare din cache
    getCache(key) {
        const cacheEntry = this.cache.get(key);
        
        if (!cacheEntry) {
            return null;
        }

        // Verifică dacă a expirat
        if (cacheEntry.expiry && Date.now() > cacheEntry.expiry) {
            this.cache.delete(key);
            this.saveCacheToStorage();
            return null;
        }

        return cacheEntry.data;
    },

    // Șterge o valoare din cache
    deleteCache(key) {
        this.cache.delete(key);
        this.saveCacheToStorage();
    },

    // Șterge tot cache-ul
    clearCache() {
        this.cache.clear();
        localStorage.removeItem('automarga_cache');
        localStorage.removeItem('automarga_pending_changes');
    },

    // Verifică dacă cache-ul pentru o cheie este valid
    isCacheValid(key) {
        const cacheEntry = this.cache.get(key);
        
        if (!cacheEntry) {
            return false;
        }

        return !cacheEntry.expiry || Date.now() <= cacheEntry.expiry;
    },

    // Salvează date în localStorage cu backup
    saveToLocalStorage(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(`automarga_${key}`, serialized);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            
            // Încearcă să elibereze spațiu
            this.cleanupLocalStorage();
            
            try {
                localStorage.setItem(`automarga_${key}`, JSON.stringify(data));
                return true;
            } catch (retryError) {
                console.error('Retry save failed:', retryError);
                return false;
            }
        }
    },

    // Încarcă date din localStorage
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`automarga_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    },

    // Șterge date din localStorage
    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(`automarga_${key}`);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    // Curăță localStorage de date vechi
    cleanupLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            const autoMargaKeys = keys.filter(key => key.startsWith('automarga_'));
            
            // Șterge cache-ul expirat
            autoMargaKeys.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.expiry && Date.now() > data.expiry) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // Șterge datele corupte
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error cleaning localStorage:', error);
        }
    },

    // Adaugă o modificare la queue pentru sincronizare offline
    addPendingChange(type, data) {
        if (this.isOnline) {
            return false; // Nu e nevoie să salvăm pentru offline dacă suntem online
        }

        try {
            const pendingChanges = this.loadFromLocalStorage('pending_changes') || [];
            
            const change = {
                id: helpers.generateId(),
                type,
                data,
                timestamp: Date.now()
            };

            pendingChanges.push(change);
            this.saveToLocalStorage('pending_changes', pendingChanges);
            
            return true;
        } catch (error) {
            console.error('Error adding pending change:', error);
            return false;
        }
    },

    // Sincronizează modificările pending când revenim online
    async syncPendingChanges() {
        const pendingChanges = this.loadFromLocalStorage('pending_changes');
        
        if (!pendingChanges || pendingChanges.length === 0) {
            return;
        }

        console.log(`Syncing ${pendingChanges.length} pending changes...`);
        
        let successCount = 0;
        const failedChanges = [];

        for (const change of pendingChanges) {
            try {
                await this.processPendingChange(change);
                successCount++;
            } catch (error) {
                console.error('Error syncing change:', error);
                failedChanges.push(change);
            }
        }

        // Salvează doar modificările care au eșuat
        if (failedChanges.length > 0) {
            this.saveToLocalStorage('pending_changes', failedChanges);
            NotificationModule.show(
                `${successCount} modificări sincronizate, ${failedChanges.length} au eșuat`, 
                'warning'
            );
        } else {
            this.removeFromLocalStorage('pending_changes');
            NotificationModule.show(
                `Toate ${successCount} modificările au fost sincronizate`, 
                'success'
            );
        }
    },

    // Procesează o modificare pending
    async processPendingChange(change) {
        switch (change.type) {
            case 'create_lucrare':
                await db.lucrari.create(change.data);
                break;
            case 'update_lucrare':
                await db.lucrari.update(change.data.id, change.data.updates);
                break;
            case 'delete_lucrare':
                await db.lucrari.delete(change.data.id);
                break;
            case 'create_client':
                await db.clienti.create(change.data);
                break;
            case 'update_client':
                await db.clienti.update(change.data.id, change.data.updates);
                break;
            case 'delete_client':
                await db.clienti.delete(change.data.id);
                break;
            default:
                console.warn('Unknown pending change type:', change.type);
        }
    },

    // Obține dimensiunea storage folosită
    getStorageSize() {
        let total = 0;
        
        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
        } catch (error) {
            console.error('Error calculating storage size:', error);
        }
        
        return total;
    },

    // Formatează dimensiunea storage
    formatStorageSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Exportă toate datele locale
    exportLocalData() {
        try {
            const data = {
                cache: Object.fromEntries(this.cache),
                localStorage: {},
                timestamp: new Date().toISOString(),
                version: CONSTANTS.APP_VERSION
            };

            // Exportă toate datele AutoMarga din localStorage
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('automarga_')) {
                    data.localStorage[key] = localStorage.getItem(key);
                }
            });

            return data;
        } catch (error) {
            console.error('Error exporting local data:', error);
            return null;
        }
    },

    // Importă date locale
    importLocalData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Date invalide pentru import');
            }

            // Importă cache
            if (data.cache) {
                this.cache.clear();
                Object.entries(data.cache).forEach(([key, value]) => {
                    this.cache.set(key, value);
                });
                this.saveCacheToStorage();
            }

            // Importă localStorage
            if (data.localStorage) {
                Object.entries(data.localStorage).forEach(([key, value]) => {
                    localStorage.setItem(key, value);
                });
            }

            NotificationModule.show('Datele au fost importate cu succes', 'success');
            return true;
        } catch (error) {
            console.error('Error importing local data:', error);
            NotificationModule.show('Eroare la importul datelor', 'error');
            return false;
        }
    },

    // Verifică statusul conexiunii
    isOnlineStatus() {
        return this.isOnline;
    },

    // Force refresh cache pentru o cheie
    invalidateCache(key) {
        this.deleteCache(key);
    },

    // Invalidează tot cache-ul pentru un prefix
    invalidateCacheByPrefix(prefix) {
        const keysToDelete = [];
        this.cache.forEach((value, key) => {
            if (key.startsWith(prefix)) {
                keysToDelete.push(key);
            }
        });
        
        keysToDelete.forEach(key => {
            this.deleteCache(key);
        });
    }
};

// Inițializează modulul când se încarcă DOM-ul
document.addEventListener('DOMContentLoaded', () => {
    window.StorageModule.init();
});

// Salvează periodic cache-ul
setInterval(() => {
    if (window.StorageModule) {
        window.StorageModule.saveCacheToStorage();
    }
}, 30000); // La fiecare 30 de secunde

// Curăță periodic localStorage
setInterval(() => {
    if (window.StorageModule) {
        window.StorageModule.cleanupLocalStorage();
    }
}, 300000); // La fiecare 5 minute