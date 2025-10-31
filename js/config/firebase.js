// Firebase Configuration
const firebaseConfig = {
    // Înlocuiește cu configurația ta din Firebase Console
    apiKey: "AIzaSyCKfbeNBx50wrtuIHo8nJgKiJ7lYXPC2y0",
    authDomain: "auto-marga.firebaseapp.com",
    projectId: "auto-marga",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export pentru utilizare în alte module
window.firebaseServices = {
    auth,
    db,
    storage,
    firebase
};

// Configurații Firestore
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Firebase persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Firebase persistence not available');
    }
});

// Colecțiile Firestore
window.collections = {
    lucrari: db.collection('lucrari'),
    clienti: db.collection('clienti'),
    piese: db.collection('piese'),
    mecanici: db.collection('mecanici'),
    facturi: db.collection('facturi'),
    utilizatori: db.collection('utilizatori')
};

console.log('Firebase initialized successfully');