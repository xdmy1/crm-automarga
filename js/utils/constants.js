// Constante pentru aplicație
window.CONSTANTS = {
    // Categoriile de lucrări
    CATEGORII_LUCRARI: [
        'Motor',
        'Caroserie',
        'Frâne',
        'Revizie',
        'Electrică',
        'Suspensie',
        'Transmisie',
        'Climatizare',
        'Vulcanizare',
        'Testare calculator',
        'Schimb ulei motor',
        'Schimb ulei cutie',
        'Schimb ulei reductor',
        'Sistem alimentare combustibil',
        'Sistem eșapament',
        'Sistem răcire motor',
        'Ambreiaj',
        'Direcție sistem',
        'Aprinderea scânteii-incandescenta',
        'Sistem curățare parbriz',
        'Altele'
    ],

    // Stările lucrărilor
    STARI_LUCRARI: {
        IN_ASTEPTARE: 'in_asteptare',
        IN_LUCRU: 'in_lucru',
        FINALIZAT: 'finalizat',
        LIVRAT: 'livrat',
        ANULAT: 'anulat'
    },

    // Rolurile utilizatorilor
    ROLURI: {
        ADMIN: 'admin',
        MECANIC: 'mecanic',
        RECEPTIONER: 'receptioner'
    },


    // Formate de export
    EXPORT_FORMATS: {
        PDF: 'pdf',
        CSV: 'csv',
        JSON: 'json'
    },

    // Perioade pentru statistici
    PERIOADE_STATISTICI: {
        ASTAZI: 'astazi',
        SAPTAMANA: 'saptamana',
        LUNA: 'luna',
        ANUL: 'anul',
        CUSTOM: 'custom'
    },

    // Mesaje pentru toast notifications
    MESSAGES: {
        SUCCESS: {
            LUCRARE_ADAUGATA: 'Lucrarea a fost adăugată cu succes!',
            LUCRARE_MODIFICATA: 'Lucrarea a fost modificată cu succes!',
            LUCRARE_STEARSA: 'Lucrarea a fost ștearsă cu succes!',
            CLIENT_ADAUGAT: 'Clientul a fost adăugat cu succes!',
            CLIENT_MODIFICAT: 'Clientul a fost modificat cu succes!',
            CLIENT_STERS: 'Clientul a fost șters cu succes!',
            EXPORT_REUSIT: 'Exportul a fost realizat cu succes!',
            LOGIN_REUSIT: 'Te-ai conectat cu succes!',
            LOGOUT_REUSIT: 'Te-ai deconectat cu succes!'
        },
        ERROR: {
            EROARE_GENERALA: 'A apărut o eroare. Te rugăm să încerci din nou.',
            EROARE_CONECTARE: 'Eroare la conectare. Verifică datele introduse.',
            EROARE_SALVARE: 'Eroare la salvarea datelor.',
            EROARE_STERGERE: 'Eroare la ștergerea datelor.',
            EROARE_EXPORT: 'Eroare la exportul datelor.',
            EROARE_INTERNET: 'Verifică conexiunea la internet.',
            CAMPURI_OBLIGATORII: 'Te rugăm să completezi toate câmpurile obligatorii.',
            FORMAT_INVALID: 'Format invalid pentru câmpul specificat.'
        },
        WARNING: {
            CONFIRMARE_STERGERE: 'Ești sigur că vrei să ștergi acest element?',
            CONFIRMARE_ANULARE: 'Ești sigur că vrei să anulezi această lucrare?',
            DATE_NESALVATE: 'Ai modificări nesalvate. Vrei să ieși fără a salva?'
        }
    },

    // Validări
    VALIDATIONS: {
        TELEFON_REGEX: /^(\+4|4|0)[0-9]{8,9}$/,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        NUMAR_INMATRICULARE_REGEX: /^[A-Z]{1,2}[0-9]{2,3}[A-Z]{3}$/,
        PRET_REGEX: /^\d+(\.\d{1,2})?$/
    },

    // Setări locale
    LOCALE: 'ro-RO',
    CURRENCY: 'MDL',

    // Setări pentru paginare
    ITEMS_PER_PAGE: 10,
    
    // Durata cache (în milisecunde)
    CACHE_DURATION: 5 * 60 * 1000, // 5 minute

    // Versiunea aplicației
    APP_VERSION: '1.0.0'
};