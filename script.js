// ==========================================
// 🗄️ DATABASE & STATS INITIALIZATION
// ==========================================
let dbProduk = JSON.parse(localStorage.getItem("Nama Toko_pos_produk")) || [
    { barcode: '8991234567891', nama: 'Nasi Goreng', harga: 15000, modal: 10000, stok: 50 },
    { barcode: '8992345678901', nama: 'Rokok Sampoerna 16', harga: 32000, modal: 29000, stok: 20 },
    { barcode: '8993456789012', nama: 'Chitato Sapi Panggang', harga: 11000, modal: 8500, stok: 15 }
];

let dbTransaksi = JSON.parse(localStorage.getItem("Nama Toko_pos_transaksi")) || [];
let keranjangBelanja = [];
let metodePembayaran = "TUNAI";

// ==========================================
// 🗺️ SISTEM PERPINDAHAN MENU (SPA NAVIGATION)
// ==========================================
function pindahMenu(targetView) {
    const semuaView = document.querySelectorAll('.menu-view');
    semuaView.forEach(view => view.classList.remove('active'));

    const semuaNav = document.querySelectorAll('.nav-item, .nav-item-center');
    semuaNav.forEach(nav => nav.classList.remove('active'));

    document.getElementById(`view-${targetView}`).classList.add('active');

    const navAktif = document.getElementById(`nav-${targetView}`);
    if (navAktif) navAktif.classList.add('active');

    if (targetView === 'dash') updateDashboardStats();
    if (targetView === 'produk') renderManajemenProduk();
    if (targetView === 'scan') renderKasirEtalase();
    if (targetView === 'transaksi') renderRiwayatTransaksi();
}

// ==========================================
// 📊 DASHBOARD & SISTEM HITUNG OMSET
// ==========================================
let dbOmsetTercatat = JSON.parse(localStorage.getItem("Nama Toko_pos_omset_tercatat")) || [];

// Modifikasi fungsi bawaan untuk menghitung omset berjalan yang BELUM di-rekap
function updateDashboardStats() {
    let omsetHariIni = 0;
    let labaKotorHariIni = 0;
    
    // Filter transaksi yang belum masuk ke rekap tutup buku sebelumnya
    let trxBelumRekap = dbTransaksi.filter(trx => !trx.sudahDirekap);
    let totalNota = trxBelumRekap.length;

    trxBelumRekap.forEach(trx => {
        omsetHariIni += trx.totalBayar;
        labaKotorHariIni += trx.totalLaba;
    });

    // Pasang angka ke kartu hijau utama
    document.getElementById("dash-omset-hari-ini").innerText = `Rp ${omsetHariIni.toLocaleString('id-ID')}`;
    document.getElementById("dash-laba-kotor").innerText = `Rp ${labaKotorHariIni.toLocaleString('id-ID')}`;
    document.getElementById("dash-total-transaksi").innerText = `${totalNota} kali`;

    // Sekaligus render list riwayat rekap di bawahnya
    renderRiwayatOmsetTercatat();
}

// 🎯 FUNGSI BARU: MENAMPILKAN DAFTAR REKAP OMSET DI BAWAH KOTAK HIJAU
function renderRiwayatOmsetTercatat() {
    const wadah = document.getElementById("list-omset-tercatat");
    const teksKosong = document.getElementById("teks-omset-kosong");
    
    if (!wadah) return;
    wadah.innerHTML = "";

    if (dbOmsetTercatat.length === 0) {
        if (teksKosong) teksKosong.style.display = "block";
        wadah.appendChild(teksKosong);
        return;
    }

    if (teksKosong) teksKosong.style.display = "none";

    // Tampilkan data rekap dari yang paling baru (dibalik)
    dbOmsetTercatat.slice().reverse().forEach(rekap => {
        wadah.innerHTML += `
            <div style="background: #f8f9fa; border-left: 4px solid #2ecc71; padding: 12px; border-radius: 8px; font-size: 13px; border-top: 1px solid #eee; border-right: 1px solid #eee; border-bottom: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px; color: #2c3e50;">
                    <span>📅 ${rekap.tanggal}</span>
                    <span style="color: #7f8c8d; font-size: 11px;">🕒 ${rekap.waktu}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; color: #555; font-size: 12px; margin-top: 6px; border-top: 1px dashed #ddd; padding-top: 6px;">
                    <div>Omset: <strong style="color:#27ae60;">Rp ${rekap.omset.toLocaleString('id-ID')}</strong></div>
                    <div>Laba: <strong style="color:#2ecc71;">Rp ${rekap.laba.toLocaleString('id-ID')}</strong></div>
                    <div style="grid-column: span 2;">Total Penjualan: <strong>${rekap.transaksi} Transaksi</strong></div>
                </div>
            </div>
        `;
    });
}

// 🎯 FUNGSI BARU: MUNBULKAN POP-UP AMANKAN OMSET (TUTUP BUKU KAS)
function bukaKonfirmasiOmset() {
    // Ambil data omset yang sedang tampil saat ini
    let omsetBerjalan = parseInt(document.getElementById("dash-omset-hari-ini").innerText.replace(/[^0-9]/g, "")) || 0;
    let labaBerjalan = parseInt(document.getElementById("dash-laba-kotor").innerText.replace(/[^0-9]/g, "")) || 0;
    let trxBerjalan = parseInt(document.getElementById("dash-total-transaksi").innerText) || 0;

    if (omsetBerjalan === 0) {
        alert("Belum ada omset atau transaksi baru yang bisa dicatat untuk hari ini!");
        return;
    }

    // Buat Pop-Up Konfirmasi Keren Custom langsung dari JavaScript
    const popUpHTML = `
        <div id="popup-konfirmasi-omset" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; font-family: sans-serif;">
            <div style="background: #fff; width: 100%; max-width: 340px; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center;">
                <div style="font-size: 40px; margin-bottom: 10px;">💾</div>
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px;">Catat & Tutup Buku?</h3>
                <p style="margin: 0 0 15px 0; color: #7f8c8d; font-size: 13px; line-height: 1.4;">
                    Sistem akan mengamankan omset sebesar <strong>Rp ${omsetBerjalan.toLocaleString('id-ID')}</strong> ke dalam riwayat harian, lalu mereset angka utama menjadi Rp 0 kembali.
                </p>
                <div style="display: flex; gap: 10px;">
                    <button onclick="tutupKonfirmasiOmset()" style="flex: 1; background: #f1f2f6; border: none; padding: 10px; border-radius: 8px; font-weight: bold; color: #57606f; cursor: pointer;">Batal</button>
                    <button onclick="eksekusiCatatOmset(${omsetBerjalan}, ${labaBerjalan}, ${trxBerjalan})" style="flex: 1; background: #2ecc71; border: none; padding: 10px; border-radius: 8px; font-weight: bold; color: #fff; cursor: pointer; box-shadow: 0 4px 10px rgba(46,204,113,0.3);">Ya, Catat!</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popUpHTML);
}

function tutupKonfirmasiOmset() {
    const popUp = document.getElementById("popup-konfirmasi-omset");
    if (popUp) popUp.remove();
}

// 🎯 FUNGSI BARU: PROSES MEMINDAHKAN DATA KE LIST BAWAH & RESET ATAS JADI RP 0
function eksekusiCatatOmset(omset, laba, transaksi) {
    const tanggalSekarang = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const waktuSekarang = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB";

    // 1. Simpan data rekap baru ke database omset
    dbOmsetTercatat.push({
        tanggal: tanggalSekarang,
        waktu: waktuSekarang,
        omset: omset,
        laba: laba,
        transaksi: transaksi
    });
    localStorage.setItem("Nama Toko_pos_omset_tercatat", JSON.stringify(dbOmsetTercatat));

    // 2. Tandai transaksi saat ini sebagai "sudah direkap" agar tidak dihitung lagi di omset atas
    dbTransaksi.forEach(trx => {
        trx.sudahDirekap = true;
    });
    localStorage.setItem("Nama Toko_pos_transaksi", JSON.stringify(dbTransaksi));

    // 3. Tutup Pop-Up dan Perbarui Dashboard (Angka atas otomatis jadi Rp 0)
    tutupKonfirmasiOmset();
    updateDashboardStats();
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Efek getar tanda sukses
}


// ==========================================
// 📦 MANAJEMEN PRODUK (STOK OPNAME)
// ==========================================
function renderManajemenProduk() {
    const wadah = document.getElementById("list-produk-stok");
    wadah.innerHTML = "";

    dbProduk.forEach((prod, index) => {
        wadah.innerHTML += `
            <div class="card-info" style="background:#fff; padding:15px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border: 1px solid #eee;">
                <div>
                    <strong style="font-size:16px;">${prod.nama}</strong>
                    <p style="color:var(--text-grey); font-size:12px; margin-top:4px;">
                        Barcode: <strong>${prod.barcode || '-'}</strong><br>
                        Jual: Rp ${prod.harga.toLocaleString('id-ID')} | Modal: Rp ${prod.modal.toLocaleString('id-ID')}
                    </p>
                </div>
                <div style="text-align:right;">
                    <span style="background:#e8f8f0; color:var(--primary); padding:4px 8px; border-radius:6px; font-weight:bold; font-size:12px;">Stok: ${prod.stok}</span>
                    <div style="margin-top:8px;">
                        <button onclick="hapusProduk(${index})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:12px;">❌ Hapus</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function bukaModalProduk() { document.getElementById("modal-produk").style.display = "flex"; }
function tutupModalProduk() { document.getElementById("modal-produk").style.display = "none"; }

function simpanProdukBaru() {
    const barcode = document.getElementById("prod-barcode").value.trim();
    const nama = document.getElementById("prod-nama").value.trim();
    const harga = parseInt(document.getElementById("prod-harga").value);
    const modal = parseInt(document.getElementById("prod-modal").value);
    const stok = parseInt(document.getElementById("prod-stok").value);

    if (!nama || isNaN(harga) || isNaN(modal) || isNaN(stok)) {
        alert("Mohon isi semua data produk dengan benar!");
        return;
    }

    dbProduk.push({ barcode, nama, harga, modal, stok });
    localStorage.setItem("Nama Toko_pos_produk", JSON.stringify(dbProduk));
    
    tutupModalProduk();
    renderManajemenProduk();
    
    document.getElementById("prod-barcode").value = "";
    document.getElementById("prod-nama").value = "";
    document.getElementById("prod-harga").value = "";
    document.getElementById("prod-modal").value = "";
}

function hapusProduk(index) {
    if (confirm("Hapus produk ini dari etalase?")) {
        dbProduk.splice(index, 1);
        localStorage.setItem("Nama Toko_pos_produk", JSON.stringify(dbProduk));
        renderManajemenProduk();
    }
}

// ==========================================
// ==========================================
// 🛒 CORE KASIR & PENJUALAN (REVISI TOTAL)
// ==========================================
function renderKasirEtalase() {
    const wadah = document.getElementById("list-produk-kasir");
    if (!wadah) return;
    wadah.innerHTML = "";

    dbProduk.forEach((prod, index) => {
        wadah.innerHTML += `
            <button onclick="tambahKeKeranjang(${index})" class="grid-produk-kasir-item" style="background:white; border:1px solid #eee; padding:15px; border-radius:15px; text-align:left; cursor:pointer; width: 100%;">
                <strong style="display:block; font-size:14px; margin-bottom:5px; color: #2c3e50;">${prod.nama}</strong>
                <span style="color:#2ecc71; font-weight:bold; display:block; font-size:15px;">Rp ${prod.harga.toLocaleString('id-ID')}</span>
                <span style="font-size:11px; color:#95a5a6; display:block; margin-top:3px;">Stok: <strong id="stok-layar-${index}">${prod.stok}</strong></span>
            </button>
        `;
    });
    hitungTotalBelanja();
}

function tambahKeKeranjang(indexDb) {
    const produkPilihan = dbProduk[indexDb];
    
    // 1. Cek apakah stok di database utama benar-benar habis
    if (produkPilihan.stok <= 0) {
        alert(`Stok untuk ${produkPilihan.nama} sudah habis!`);
        return;
    }

    // 2. Potong stok produk langsung di DB sementara (Layar langsung berkurang)
    produkPilihan.stok--;
    
    // Update angka stok khusus produk ini di layar etalase secara realtime
    const elemenStokLayar = document.getElementById(`stok-layar-${indexDb}`);
    if (elemenStokLayar) elemenStokLayar.innerText = produkPilihan.stok;

    // 3. Masukkan ke data keranjang belanja
    let itemExis = keranjangBelanja.find(item => item.indexAsOriginal === indexDb);
    if (itemExis) {
        itemExis.qty++;
    } else {
        keranjangBelanja.push({
            nama: produkPilihan.nama,
            harga: produkPilihan.harga,
            modal: produkPilihan.modal,
            qty: 1,
            indexAsOriginal: indexDb
        });
    }
    
    // Update badge counter total item di pojok kanan atas (misal: "11 Item")
    const badgeCount = document.getElementById("keranjang-count") || document.querySelector(".nav-item-center span") || document.styleSheets[0]; 
    // Sesuaikan selector badge jumlah item di atas navbar kasir jika ada elemen khusus
    let totalQty = keranjangBelanja.reduce((a, b) => a + b.qty, 0);
    let elemenBadge = document.querySelector("span[style*='background']"); // deteksi otomatis pill item atas
    if(elemenBadge) elemenBadge.innerText = `${totalQty} Item`;

    // 4. Hitung total uang sekaligus RENDER list produk di atas tombol bayar
    hitungTotalBelanja();
}

// FUNGSI BARU: UNTUK MENGURANGI/BATALKAN ITEM DI KERANJANG
function kurangiDariKeranjang(indexKeranjang) {
    const item = keranjangBelanja[indexKeranjang];
    
    // Kembalikan stoknya ke database produk utama
    dbProduk[item.indexAsOriginal].stok++;
    
    // Update angka stok di etalase kembali naik
    const elemenStokLayar = document.getElementById(`stok-layar-${item.indexAsOriginal}`);
    if (elemenStokLayar) elemenStokLayar.innerText = dbProduk[item.indexAsOriginal].stok;

    item.qty--;
    if (item.qty <= 0) {
        keranjangBelanja.splice(indexKeranjang, 1);
    }

    hitungTotalBelanja();
}

let grandTotal = 0;
function hitungTotalBelanja() {
    grandTotal = keranjangBelanja.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    document.getElementById("kasir-total-harga").innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;

    // 🔥 KUNCI UTAMA: RENDER OTOMATIS DAFTAR ISI KERANJANG DI ATAS TOTAL BELANJA
    // Pastikan di index.html, di atas tulisan "Total Belanja:" ada container kosong bernama id="preview-list-keranjang"
    let wadahKeranjang = document.getElementById("preview-list-keranjang");
    
    // Jika wadah belum dibuat di HTML, kita injeksi otomatis tepat di atas teks Total Belanja agar aman
    if (!wadahKeranjang) {
        const areaTotal = document.getElementById("kasir-total-harga").parentElement;
        if (areaTotal) {
            areaTotal.insertAdjacentHTML('beforebegin', `<div id="preview-list-keranjang" style="max-height: 120px; overflow-y: auto; padding: 10px; margin-bottom: 5px; border-top: 1px dashed #ddd; display: flex; flex-direction: column; gap: 6px; width: 100%; box-sizing: border-box;"></div>`);
            wadahKeranjang = document.getElementById("preview-list-keranjang");
        }
    }

    if (!wadahKeranjang) return;
    wadahKeranjang.innerHTML = "";

    if (keranjangBelanja.length === 0) {
        wadahKeranjang.innerHTML = `<span style="font-size: 12px; color: #aaa; text-align: center; display: block; padding: 5px 0;">Keranjang masih kosong</span>`;
        return;
    }

    // Tampilkan rincian barang yang sedang dibeli secara rapi
    keranjangBelanja.forEach((item, index) => {
        wadahKeranjang.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; padding: 6px 10px; border-radius: 8px; font-size: 12px; border: 1px solid #eee;">
                <div style="flex: 1; padding-right: 10px;">
                    <strong style="color: #2c3e50; display: block;">${item.nama}</strong>
                    <span style="color: #7f8c8d;">Rp ${item.harga.toLocaleString('id-ID')} x ${item.qty}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #27ae60;">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</strong>
                    <button onclick="kurangiDariKeranjang(${index})" style="background: #ff7675; color: white; border: none; border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer; font-weight: bold;">-</button>
                </div>
            </div>
        `;
    });
}

// ==========================================
// 💳 MODAL PROSES PEMBAYARAN & FORMAT OTOMATIS
// ==========================================
function bukaModalMetodeBayar() {
    if (keranjangBelanja.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }
    document.getElementById("modal-tagihan-nominal").innerText = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    document.getElementById("modal-pembayaran").style.display = "flex";
    setMetodeBayar('TUNAI'); 
}

function tutupModalBayar() { document.getElementById("modal-pembayaran").style.display = "none"; }

function formatUangOtomatis(input) {
    let angkaMurni = input.value.replace(/[^0-9]/g, "");
    if (angkaMurni === "") {
        input.value = "";
    } else {
        input.value = parseInt(angkaMurni).toLocaleString('id-ID');
    }
    hitungKembalianLansung();
}

function setMetodeBayar(metode) {
    metodePembayaran = metode;
    const fTunai = document.getElementById("form-tunai-detail");
    const fQris = document.getElementById("form-qris-detail");

    if (metode === 'QRIS') {
        fTunai.style.display = "none";
        fQris.style.display = "block";
    } else {
        fTunai.style.display = "block";
        fQris.style.display = "none";
        document.getElementById("input-nominal-tunai").value = grandTotal.toLocaleString('id-ID');
        hitungKembalianLansung();
    }
}

function hitungKembalianLansung() {
    const stringUang = document.getElementById("input-nominal-tunai").value;
    const bayar = parseInt(stringUang.replace(/[^0-9]/g, "")) || 0;
    const kembalian = bayar - grandTotal;
    
    document.getElementById("text-kembalian-tunai").innerText = `Rp ${Math.max(0, kembalian).toLocaleString('id-ID')}`;
}

// ==========================================
// 🚀 FINIS TRANSAKSI & STRUK PEMBAYARAN DIGITAL (DIPERBARUI)
// ==========================================
function simpanTransaksiFinis() {
    let totalLabaNota = 0;
    const stringUang = document.getElementById("input-nominal-tunai").value;
    const nominalBayarMurni = metodePembayaran === 'QRIS' ? grandTotal : (parseInt(stringUang.replace(/[^0-9]/g, "")) || 0);
    const nominalKembalianMurni = Math.max(0, nominalBayarMurni - grandTotal);
    
    if (metodePembayaran === 'TUNAI' && nominalBayarMurni < grandTotal) {
        alert("Uang tunai yang dimasukkan kurang!");
        return;
    }

    // Potong stok & hitung laba
    keranjangBelanja.forEach(item => {
        dbProduk[item.indexAsOriginal].stok -= item.qty;
        let labaPerItem = item.harga - item.modal;
        totalLabaNota += (labaPerItem * item.qty);
    });

    const notaId = "TRX-" + Date.now();
    const waktuSekarang = new Date().toLocaleTimeString('id-ID');
    const tanggalSekarang = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const notaBaru = {
        id: notaId,
        waktu: waktuSekarang,
        item: keranjangBelanja,
        totalBayar: grandTotal,
        totalLaba: totalLabaNota,
        metode: metodePembayaran
    };

    dbTransaksi.push(notaBaru);
    
    localStorage.setItem("Nama Toko_pos_produk", JSON.stringify(dbProduk));
    localStorage.setItem("Nama Toko_pos_transaksi", JSON.stringify(dbTransaksi));

    // 🎯 LOGIKA BARU: MEMBUAT & MENAMPILKAN STRUK DIGITAL PREMIUM OVERLAY
    let barisItemStruk = "";
    keranjangBelanja.forEach(item => {
        barisItemStruk += `
            <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px; color:#333;">
                <span style="flex:1;">${item.nama} <span style="color:#777;">(x${item.qty})</span></span>
                <span style="font-weight:600; text-align:right;">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
            </div>
        `;
    });

    const modalStrukHTML = `
        <div id="overlay-struk-digital" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; font-family:sans-serif; padding:20px; box-sizing:border-box;">
            <div style="background:#fff; width:100%; max-width:360px; border-radius:20px; padding:25px; box-shadow:0 10px 25px rgba(0,0,0,0.2); animation: popUpStruk 0.3s ease-out-back;">
                
                <div style="text-align:center; border-bottom:2px dashed #ddd; padding-bottom:15px; margin-bottom:15px;">
                    <div style="width:50px; height:50px; background:#e8f8f0; color:#2ecc71; border-radius:50%; display:flex; justify-content:center; align-items:center; margin:0 auto 10px auto; font-size:24px;">✓</div>
                    <h3 style="margin:0 0 5px 0; font-size:18px; color:#2c3e50; font-weight:bold;">Nama Toko</h3>
                    <p style="margin:0; font-size:11px; color:#7f8c8d;">Transaksi Berhasil & Stok Diperbarui</p>
                </div>

                <div style="font-size:12px; color:#7f8c8d; margin-bottom:15px; line-height:1.4;">
                    <div style="display:flex; justify-content:space-between;"><span>No. Nota:</span><strong style="color:#2c3e50;">${notaId}</strong></div>
                    <div style="display:flex; justify-content:space-between;"><span>Tanggal:</span><span>${tanggalSekarang}</span></div>
                    <div style="display:flex; justify-content:space-between;"><span>Waktu:</span><span>${waktuSekarang} WIB</span></div>
                    <div style="display:flex; justify-content:space-between;"><span>Metode:</span><span style="background:#f1f2f6; padding:1px 6px; border-radius:4px; font-weight:bold; color:#2c3e50; font-size:10px;">${metodePembayaran}</span></div>
                </div>

                <div style="border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px; max-height:150px; overflow-y:auto;">
                    ${barisItemStruk}
                </div>

                <div style="background:#f8f9fa; padding:12px; border-radius:10px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; font-size:13px; color:#555; margin-bottom:4px;">
                        <span>Total Tagihan:</span>
                        <span>Rp ${grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:13px; color:#555; margin-bottom:6px; border-bottom:1px solid #e0e0e0; padding-bottom:6px;">
                        <span>Uang Diterima:</span>
                        <span>Rp ${nominalBayarMurni.toLocaleString('id-ID')}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:15px; font-weight:bold; color:#27ae60;">
                        <span>Kembalian:</span>
                        <span>Rp ${nominalKembalianMurni.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <button onclick="tutupStrukDanReset()" style="width:100%; background:#2ecc71; color:#fff; border:none; padding:12px; border-radius:12px; font-size:15px; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(46,204,113,0.3); outline:none;">
                    Selesai & Kembali
                </button>
            </div>
        </div>
        <style>
            @keyframes popUpStruk {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;

    // Pasang struk di body halaman
    document.body.insertAdjacentHTML('beforeend', modalStrukHTML);

    // Reset sistem kasir dibelakang layar
    keranjangBelanja = [];
    document.getElementById("keranjang-count").innerText = "0 Item";
    tutupModalBayar();
}

// 🎯 FUNGSI BARU: MENUTUP STRUK DAN LOGOUT KE DASHBOARD
function tutupStrukDanReset() {
    const strukOverlay = document.getElementById("overlay-struk-digital");
    if (strukOverlay) {
        strukOverlay.remove();
    }
    pindahMenu('dash'); // Lempar ke dashboard untuk cek pembaruan omset terbaru
}

// ==========================================
// 📊 RENDER TABEL RIWAYAT NOTA TRANSAKSI
// ==========================================
function renderRiwayatTransaksi() {
    const wadah = document.getElementById("daftar-riwayat-nota");
    wadah.innerHTML = "";

    if (dbTransaksi.length === 0) {
        wadah.innerHTML = `<p style="text-align:center; color:#aaa; margin-top:20px;">Belum ada riwayat penjualan.</p>`;
        return;
    }

    dbTransaksi.slice().reverse().forEach(nota => {
        let rincianItem = nota.item.map(i => `${i.nama} (${i.qty}x)`).join(", ");
        wadah.innerHTML += `
            <div class="card-info" style="background:white; padding:15px; border-radius:15px; margin-bottom:12px; border:1px solid #eee;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #eee; padding-bottom:8px; margin-bottom:8px;">
                    <span style="font-weight:bold; color:var(--primary); font-size:12px;">${nota.id}</span>
                    <span style="font-size:11px; color:#aaa; margin-left:auto;">🕒 ${nota.waktu}</span>
                </div>
                <p style="font-size:13px; font-weight:600;">${rincianItem}</p>
                <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:12px;">
                    <span>Metode: <strong>${nota.metode}</strong></span>
                    <span style="color:var(--primary); font-weight:bold;">Total: Rp ${nota.totalBayar.toLocaleString('id-ID')}</span>
                </div>
            </div>
        `;
    });
}

function resetSemuaData() {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh data produk dan laporan omset di aplikasi ini?")) {
        localStorage.clear();
        location.reload();
    }
}

window.onload = function() {
    pindahMenu('dash');
};

// ==========================================
// 📷 LOGIKA MESIN SCANNER BARCODE KAMERA
// ==========================================
let html5QrcodeScanner = null;

function toggleKameraScanner() {
    const areaKamera = document.getElementById("reader-kamera");
    const btnKamera = document.getElementById("btn-toggle-kamera");

    if (html5QrcodeScanner === null) {
        areaKamera.style.display = "block";
        btnKamera.innerText = "Matikan Kamera";
        btnKamera.style.background = "#e74c3c";

        html5QrcodeScanner = new Html5Qrcode("reader-kamera");
        const lebarScanner = Math.floor(areaKamera.offsetWidth * 0.8);

        html5QrcodeScanner.start(
            { facingMode: "environment" }, 
            {
                fps: 15, 
                qrbox: { width: lebarScanner, height: 220 } 
            },
            (decodedText, decodedResult) => {
                prosesScanBarcodeMasukKeranjang(decodedText);
            },
            (errorMessage) => {}
        ).catch((err) => {
            alert("Gagal mengakses kamera: " + err);
            matikanKameraLansung();
        });

    } else {
        matikanKameraLansung();
    }
}

function matikanKameraLansung() {
    const areaKamera = document.getElementById("reader-kamera");
    const btnKamera = document.getElementById("btn-toggle-kamera");

    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner = null;
            areaKamera.style.display = "none";
            btnKamera.innerText = "Buka Kamera";
            btnKamera.style.background = "var(--primary)";
        }).catch((err) => {
            html5QrcodeScanner = null;
            areaKamera.style.display = "none";
        });
    }
}

function prosesScanBarcodeMasukKeranjang(kodeScanned) {
    let indexKetemu = dbProduk.findIndex(p => p.barcode === kodeScanned);

    if (indexKetemu !== -1) {
        tambahKeKeranjang(indexKetemu);
        if (navigator.vibrate) navigator.vibrate(100);
    } else {
        alert(`Produk dengan Barcode [${kodeScanned}] belum didaftarkan di menu Produk!`);
    }
}

const originalPindahMenu = pindahMenu;
pindahMenu = function(targetView) {
    if (targetView !== 'scan') {
        matikanKameraLansung();
    }
    originalPindahMenu(targetView);
};

let qrisScanner = null; // Variabel global untuk scanner QRIS

function setMetodeBayar(metode) {
    const formTunai = document.getElementById('form-tunai-detail');
    const formQris = document.getElementById('form-qris-detail');
    const btnSelesai = document.querySelector('.btn-selesai');
    
    if (metode === 'TUNAI') {
        formTunai.style.display = 'block';
        formQris.style.display = 'none';
        btnSelesai.style.display = 'block'; // Tombol manual tetap ada untuk tunai
        
        // Matikan kamera QRIS jika user putar balik ke tunai
        if (qrisScanner) {
            qrisScanner.stop().catch(err => console.log(err));
        }
    } else if (metode === 'QRIS') {
        formTunai.style.display = 'none';
        formQris.style.display = 'block';
        btnSelesai.style.display = 'none'; // Sembunyikan tombol! Biar sistem yang eksekusi otomatis
        
        document.getElementById('status-scan-qris').innerText = "📷 Kamera siap, scan struk/QR penanda sukses...";
        document.getElementById('status-scan-qris').style.color = "#64748b";

        // Jalankan Scanner Otomatis untuk mencocokkan Bukti
        jalankanScannerBuktiQRIS();
    }
}

function jalankanScannerBuktiQRIS() {
    // Inisialisasi scanner pada div 'reader-qris-bukti'
    qrisScanner = new Html5Qrcode("reader-qris-bukti");
    
    const config = { fps: 10, qrbox: { width: 200, height: 200 } };
    
    qrisScanner.start(
        { facingMode: "environment" }, // Pakai kamera belakang HP Kasir
        config,
        (decodedText, decodedResult) => {
            // --- JIKA BERHASIL MENDETEKSI GAMBAR / KODE QR BUKTI ---
            document.getElementById('status-scan-qris').innerText = "✅ Bukti Terdeteksi! Memproses...";
            document.getElementById('status-scan-qris').style.color = "#27ae60";
            
            // Matikan kamera biar tidak bentrok
            qrisScanner.stop().then(() => {
                // Otomatis panggil fungsi simpan transaksi tanpa pencet tombol!
                simpanTransaksiFinis(); 
                
                // Panggil cetak / munculkan pop-up nota
                munculkanStrukNotaPopUp();
            }).catch(err => console.log(err));
        },
        (errorMessage) => {
            // Abaikan error nyari kode biar gak menembus log console
        }
    ).catch(err => {
        console.log("Gagal membuka kamera QRIS: ", err);
        document.getElementById('status-scan-qris').innerText = "❌ Gagal membuka kamera.";
    });
}

// Pastikan fungsi tutup modal juga mematikan kamera QRIS agar baterai HP awet
function tutupModalBayar() {
    document.getElementById('modal-pembayaran').style.display = 'none';
    if (qrisScanner) {
        qrisScanner.stop().catch(err => console.log(err));
    }
}

function munculkanStrukNotaPopUp() {
    // Logika menampilkan pop up struk belanja Abang yang sudah ada sebelumnya
    alert("🧾 Transaksi Berhasil! Struk Penjualan Siap Dicetak.");
}
// ==========================================
// 📊 GRAPH SYSTEM (GRAFIK TREN MAJU)
// ==========================================
function updateGrafikTren() {
    // Menggunakan database asli Abang: wawan_pos_omset_tercatat
    let riwayatOmset = JSON.parse(localStorage.getItem("Nama Toko_pos_omset_tercatat")) || [];
    let omsetPerHari = { "Sen": 0, "Sel": 0, "Rab": 0, "Kam": 0, "Jum": 0, "Sab": 0, "Min": 0 };
    
    // Konversi nama hari dari format tanggal panjang Indonesia (jika ada) atau deteksi otomatis
    riwayatOmset.forEach(data => {
        // Ambil hari dari data atau buat fallback hari ini jika formatnya teks tanggal panjang
        let hariKey = data.hari;
        if (!hariKey && data.tanggal) {
            // Jaga-jaga jika data.hari belum tersimpan, kita tebak dari penulisan tanggalnya
            if (data.tanggal.includes("Senin")) hariKey = "Sen";
            else if (data.tanggal.includes("Selasa")) hariKey = "Sel";
            else if (data.tanggal.includes("Rabu")) hariKey = "Rab";
            else if (data.tanggal.includes("Kamis")) hariKey = "Kam";
            else if (data.tanggal.includes("Jumat")) hariKey = "Jum";
            else if (data.tanggal.includes("Sabtu")) hariKey = "Sab";
            else if (data.tanggal.includes("Minggu")) hariKey = "Min";
        }
        
        // Jika masih tidak ketemu, gunakan hari acak/hari ini sebagai penyeimbang grafik
        if (!hariKey || omsetPerHari[hariKey] === undefined) {
            const daftarHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
            hariKey = daftarHari[new Date().getDay()];
        }

        omsetPerHari[hariKey] += data.omset || 0;
    });

    let omsetMaksimal = Math.max(...Object.values(omsetPerHari));

    for (let hari in omsetPerHari) {
        let elemenBar = document.getElementById(`bar-${hari}`);
        if (elemenBar) {
            if (omsetMaksimal > 0) {
                let persentaseTinggi = (omsetPerHari[hari] / omsetMaksimal) * 100;
                elemenBar.style.height = `${Math.max(persentaseTinggi, 8)}%`; // Minimal tinggi 8% agar tetap estetis
            } else {
                elemenBar.style.height = "0%";
            }
        }
    }
}

// ==========================================
// 🚨 POP-UP KONFIRMASI & EKSEKUSI TUTUP BUKU (SINKRON)
// ==========================================

// 1. TAMPILKAN POP-UP KONFIRMASI MODERN
function bukaKonfirmasiOmset() {
    let omsetBerjalan = parseInt(document.getElementById("dash-omset-hari-ini").innerText.replace(/[^0-9]/g, "")) || 0;
    
    // Jika omset masih Rp 0, munculkan notifikasi melayang (bukan alert kaku)
    if (omsetBerjalan === 0) {
        let toast = document.createElement("div");
        toast.style = "position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:#e74c3c; color:white; padding:10px 20px; border-radius:20px; font-size:12px; z-index:9999; font-weight:bold; box-shadow:0 4px 10px rgba(0,0,0,0.2);";
        toast.innerText = "Omset hari ini masih Rp 0, tidak ada yang perlu diamankan!";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
        return;
    }

    // Suntik nominal asli ke text modal konfirmasi di HTML Abang
    const elemenTeksNominal = document.getElementById("konfirmasi-nominal-teks");
    if (elemenTeksNominal) {
        elemenTeksNominal.innerText = `Rp ${omsetBerjalan.toLocaleString('id-ID')}`;
    }
    
    // Buka overlay modal premium
    const modalOmset = document.getElementById("modal-konfirmasi-omset");
    if (modalOmset) {
        modalOmset.style.display = "flex";
    } else {
        // Jika id HTML modal konfirmasi belum diganti, pakai cadangan fungsi pop-up string otomatis Abang
        // Tapi disarankan ikuti instruksi HTML di bawah agar UI-nya mewah
        alert(`Amankan Omset Sebesar Rp ${omsetBerjalan.toLocaleString('id-ID')}?`);
        eksekusiSimpanOmset();
    }
}

// 2. TUTUP POP-UP JIKA KLIK BATAL
function tutupModalKonfirmasi() {
    const modalOmset = document.getElementById("modal-konfirmasi-omset");
    if (modalOmset) modalOmset.style.display = "none";
}

// 3. PROSES SIMPAN, KUNCI PERMANEN, DAN RESET DASHBOARD
function eksekusiSimpanOmset() {
    let omsetBerjalan = parseInt(document.getElementById("dash-omset-hari-ini").innerText.replace(/[^0-9]/g, "")) || 0;
    let labaBerjalan = parseInt(document.getElementById("dash-laba-kotor").innerText.replace(/[^0-9]/g, "")) || 0;
    let trxBerjalan = parseInt(document.getElementById("dash-total-transaksi").innerText) || 0;

    const tanggalSekarang = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const waktuSekarang = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB";
    
    const daftarHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    let hariIni = daftarHari[new Date().getDay()];

    // A. Masukkan data ke database rekap utama Abang (wawan_pos_omset_tercatat)
    dbOmsetTercatat.push({
        tanggal: tanggalSekarang,
        waktu: waktuSekarang,
        hari: hariIni,
        omset: omsetBerjalan,
        laba: labaBerjalan,
        transaksi: trxBerjalan
    });
    localStorage.setItem("Nama Toko_pos_omset_tercatat", JSON.stringify(dbOmsetTercatat));

    // B. PENGUNCI UTAMA: Ubah status transaksi aktif menjadi sudah direkap secara permanen
    dbTransaksi.forEach(trx => {
        trx.sudahDirekap = true;
    });
    localStorage.setItem("Nama Toko_pos_transaksi", JSON.stringify(dbTransaksi));

    // C. Sembunyikan Modal & Perbarui Tampilan Dashboard secara Realtime
    tutupModalKonfirmasi();
    updateDashboardStats(); // Ini akan otomatis memfilter ulang dbTransaksi sehingga atas jadi Rp 0
    updateGrafikTren();     // Jalankan grafik realtime

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Getar sukses haptic

    // D. Buat Toast Notifikasi Sukses yang Halus & Melayang
    let toastSukses = document.createElement("div");
    toastSukses.style = "position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:#27ae60; color:white; padding:10px 20px; border-radius:20px; font-size:12px; z-index:9999; font-weight:bold; box-shadow:0 4px 10px rgba(0,0,0,0.2);";
    toastSukses.innerText = "✔ Omset berhasil diamankan ke catatan!";
    document.body.appendChild(toastSukses);
    setTimeout(() => toastSukses.remove(), 2500);
}

// ==========================================
// 🚀 EVENT LISTENER SAAT HALAMAN DIBUKA
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Update grafik & sinkronisasi data visual saat pertama kali app di-load
    updateGrafikTren();
});

// Masukkan trigger grafik ke fungsi window.onload bawaan Abang yang sudah ada
const originalOnload = window.onload;
window.onload = function() {
    if (typeof originalOnload === "function") originalOnload();
    updateGrafikTren();
};

