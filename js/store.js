(function () {
  const seedFleet = (typeof CARS !== 'undefined') ? CARS.slice() : [];

  const firebaseConfig = {
    apiKey: "AIzaSyCw_mOt4VMEwgs5rvakn77X3lSORG3_LI0",
    authDomain: "exodus-exotics.firebaseapp.com",
    projectId: "exodus-exotics",
    storageBucket: "exodus-exotics.firebasestorage.app",
    messagingSenderId: "1086035673524",
    appId: "1:1086035673524:web:a2f7b675b473fee57db2e1"
  };

  firebase.initializeApp(firebaseConfig);
  const db   = firebase.firestore();
  const auth = firebase.auth();

  const fleetCol   = db.collection('fleet');
  const inquiryCol = db.collection('inquiries');

  window.CARS = [];

  // Keeps window.CARS in sync with the cloud database in real time.
  // Resolves the first time data arrives; calls onFleetUpdate on every change after that.
  window.fleetReady = new Promise(resolve => {
    let resolved = false;
    fleetCol.orderBy('order').onSnapshot(snapshot => {
      window.CARS = snapshot.docs.map(doc => doc.data());
      if (!resolved) {
        resolved = true;
        resolve(window.CARS);
      } else if (typeof window.onFleetUpdate === 'function') {
        window.onFleetUpdate(window.CARS);
      }
    });

    // One-time seed from the original hardcoded fleet if the database is empty
    fleetCol.limit(1).get().then(snap => {
      if (snap.empty && seedFleet.length) {
        seedFleet.forEach((car, i) => fleetCol.doc(String(car.id)).set({ ...car, order: i }));
      }
    });
  });

  window.saveFleetCar = async function (car) {
    await fleetCol.doc(String(car.id)).set(car);
  };

  window.deleteFleetCar = async function (id) {
    await fleetCol.doc(String(id)).delete();
  };

  window.getInquiries = async function () {
    const snap = await inquiryCol.orderBy('submittedAt', 'desc').get();
    return snap.docs.map(doc => doc.data());
  };

  window.saveInquiry = async function (inquiry) {
    const id = Date.now();
    await inquiryCol.doc(String(id)).set({ ...inquiry, id, submittedAt: new Date().toISOString() });
  };

  window.deleteInquiry = async function (id) {
    await inquiryCol.doc(String(id)).delete();
  };

  // ===== ADMIN AUTH =====
  window.adminLogin = function (email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  };

  window.adminLogout = function () {
    return auth.signOut();
  };

  window.onAdminAuthChange = function (callback) {
    auth.onAuthStateChanged(callback);
  };
})();
