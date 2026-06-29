// ==========================================
// 🔐 GOOGLE AUTHENTICATION SYSTEM (FIREBASE ASLI)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// Konfigurasi asli kotak hitam milik Abang
const firebaseConfig = {
    apiKey: "AIzaSyAcvaZATpsbSNtBAuKxuCsvpfLjODc7Cko",
    authDomain: "asisten-toko.firebaseapp.com",
    projectId: "asisten-toko",
    storageBucket: "asisten-toko.firebasestorage.app",
    messagingSenderId: "493614445360",
    appId: "1:493614445360:web:2f235b72bdace6578c8ef5",
    measurementId: "G-1923M0HH2W"
};

// Inisialisasi Firebase & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Variabel Global untuk menyimpan data user yang sedang aktif
let userAktif = null;

// TRIGGER LOGIN GOOGLE (POP-UP)
window.loginGoogle = function() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("Sukses Login:", user.displayName);
        })
        .catch((error) => {
            console.error("Gagal Login:", error.message);
            alert("Gagal terhubung dengan Google, silakan coba lagi.");
        });
}

// FUNGSI LOGOUT
window.logoutGoogle = function() {
    if(confirm("Apakah Abang yakin ingin keluar dari akun?")) {
        signOut(auth).then(() => {
            console.log("Berhasil Logout");
        });
    }
}

// OBSERVER STATUS LOGIN (Mendeteksi otomatis status login)
onAuthStateChanged(auth, (user) => {
    // Menyesuaikan dengan class avatar dan info di HTML Abang
    const infoWadah = document.querySelector(".user-info");
    const avatarWadah = document.querySelector(".avatar");
    const btnLogin = document.getElementById("btn-login"); // Pastikan ID ini ada di tombol login HTML
    const btnLogout = document.getElementById("btn-logout"); // Pastikan ID ini ada di tombol logout HTML

    if (user) {
        userAktif = user;
        
        // Ganti inisial WP jadi foto profil Google Abang
        if (avatarWadah) {
            avatarWadah.innerHTML = `<img src="${user.photoURL}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%;">`;
        }
        
        if (infoWadah) {
            infoWadah.innerHTML = `
                <h3>${user.displayName}</h3>
                <p style="color: #2ecc71;">● Online (Firebase)</p>
            `;
        }
        
        if (btnLogin) btnLogin.style.display = "none";
        if (btnLogout) btnLogout.style.display = "block";

        console.log("UID Pengguna Aktif:", user.uid);
    } else {
        userAktif = null;
        
        if (avatarWadah) avatarWadah.innerHTML = "WP";
        if (infoWadah) {
            infoWadah.innerHTML = `
                <h3>Nama Toko</h3>
                <p>Offline / Lokal</p>
            `;
        }
        
        if (btnLogin) btnLogin.style.display = "block";
        if (btnLogout) btnLogout.style.display = "none";
    }
});

// ==========================================
// 🗄️ DATABASE & STATS INITIALIZATION (LANJUTAN KODE KASIR ABANG)
// ==========================================
// [Sisa kode kasir Abang yang kemarin seperti let dbProduk, pindahMenu, dll dibiarkan di bawahnya]
