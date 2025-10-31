// Funcții helper pentru aplicație
window.helpers = {
    // Formatează data în format românesc
    formatDate(date, includeTime = false) {
        if (!date) return '';
        
        const d = date instanceof Date ? date : new Date(date);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return d.toLocaleDateString(CONSTANTS.LOCALE, options);
    },

    // Formatează prețul în MDL
    formatPrice(price) {
        if (price === null || price === undefined) return '0,00 MDL';
        return new Intl.NumberFormat(CONSTANTS.LOCALE, {
            style: 'currency',
            currency: CONSTANTS.CURRENCY
        }).format(price);
    },

    // Formatează numărul de telefon
    formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('40')) {
            return `+${cleaned}`;
        } else if (cleaned.startsWith('0')) {
            return `+4${cleaned}`;
        }
        return `+40${cleaned}`;
    },

    // Validează adresa de email
    validateEmail(email) {
        return CONSTANTS.VALIDATIONS.EMAIL_REGEX.test(email);
    },

    // Validează numărul de telefon
    validatePhone(phone) {
        return CONSTANTS.VALIDATIONS.TELEFON_REGEX.test(phone);
    },

    // Validează numărul de înmatriculare
    validateLicensePlate(plate) {
        return CONSTANTS.VALIDATIONS.NUMAR_INMATRICULARE_REGEX.test(plate.toUpperCase());
    },

    // Validează prețul
    validatePrice(price) {
        return CONSTANTS.VALIDATIONS.PRET_REGEX.test(price.toString());
    },

    // Generează un ID unic
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Calculează diferența de zile între două date
    daysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Calculează durata unei lucrări
    calculateWorkDuration(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        return this.daysDifference(startDate, endDate);
    },

    // Sortează un array de obiecte după o proprietate
    sortBy(array, property, ascending = true) {
        return array.sort((a, b) => {
            let aVal = a[property];
            let bVal = b[property];
            
            // Handle dates
            if (aVal instanceof Date || typeof aVal === 'string' && !isNaN(Date.parse(aVal))) {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    },

    // Filtrează un array după mai multe criterii
    filterBy(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                
                const itemValue = item[key];
                const filterValue = filters[key];
                
                if (typeof itemValue === 'string') {
                    return itemValue.toLowerCase().includes(filterValue.toLowerCase());
                }
                
                return itemValue === filterValue;
            });
        });
    },

    // Caută în text
    searchInText(text, searchTerm) {
        if (!text || !searchTerm) return false;
        return text.toLowerCase().includes(searchTerm.toLowerCase());
    },

    // Calculează statistici pentru un array numeric
    calculateStats(numbers) {
        if (!numbers || numbers.length === 0) return {
            sum: 0,
            average: 0,
            min: 0,
            max: 0,
            count: 0
        };
        
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        return {
            sum,
            average: sum / numbers.length,
            min: Math.min(...numbers),
            max: Math.max(...numbers),
            count: numbers.length
        };
    },

    // Convertește obiect în query string pentru URL
    objectToQueryString(obj) {
        return Object.keys(obj)
            .filter(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join('&');
    },

    // Parsează query string din URL
    parseQueryString(queryString) {
        const params = {};
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            });
        }
        return params;
    },

    // Debounce pentru input-uri
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle pentru scroll events
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            if (!timeout) {
                func(...args);
                timeout = setTimeout(() => {
                    timeout = null;
                }, wait);
            }
        };
    },

    // Escape HTML pentru securitate
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Copiază text în clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    },

    // Descarcă fișier
    downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },

    // Capitalizează prima literă
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    // Truncate text
    truncate(str, length = 50) {
        return str.length > length ? str.substring(0, length) + '...' : str;
    }
};