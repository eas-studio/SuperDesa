// assets/js/db.js

/**
 * File ini bertanggung jawab untuk mendefinisikan dan menginisialisasi
 * database IndexedDB menggunakan library Dexie.js.
 * * Semua definisi tabel (skema) dan koneksi awal ke database
 * diatur di sini.
 */

// 1. Membuat instance database baru dengan nama 'SuperDesaDB'.
//    Objek 'db' ini akan menjadi titik akses utama kita ke database.
const db = new Dexie('SuperDesaDB');

// 2. Mendefinisikan skema database.
//    Kita menggunakan method .version() untuk menentukan versi skema.
//    Jika database belum ada, Dexie akan membuatnya.
//    Jika sudah ada tapi versinya lebih rendah, Dexie akan meng-upgrade-nya.
db.version(1).stores({
    /**
     * Tabel 'warga': Menyimpan semua data penduduk.
     * * Skema Kolom (Indexing):
     * '++id': Primary key yang akan bertambah otomatis (auto-increment).
     * 'nik': Diindeks untuk pencarian cepat berdasarkan NIK. Tanda '&' membuatnya unik.
     * 'nomor_kk': Diindeks untuk pencarian berdasarkan Nomor KK.
     * 'nama': Diindeks untuk pencarian nama (bisa parsial, misal: 'budi').
     * Kolom lain seperti jenis_kelamin, alamat, dll tidak perlu diindeks
     * karena jarang digunakan sebagai kriteria pencarian utama, tapi tetap akan tersimpan.
     */
    warga: '++id, &nik, nomor_kk, nama',

    /**
     * Tabel 'surat_tercetak': Menyimpan riwayat surat yang telah dibuat.
     * * Skema Kolom (Indexing):
     * '++id': Primary key auto-increment.
     * 'tanggal_pembuatan': Diindeks untuk memfilter surat berdasarkan tanggal.
     * 'nik_pemohon': Diindeks untuk menghubungkan ke data warga yang bersangkutan.
     */
    surat_tercetak: '++id, tanggal_pembuatan, nik_pemohon',

    /**
     * Tabel 'pengaturan': Menyimpan konfigurasi aplikasi.
     * Ini adalah tabel key-value sederhana.
     * * Skema Kolom (Indexing):
     * 'kunci': Primary key. Tidak menggunakan auto-increment (++).
     * Contoh: kunci='nama_desa', nilai='Desa Makmur'.
     */
    pengaturan: 'kunci',

    /**
     * Tabel 'pengguna': Menyimpan data login pengguna.
     * * Skema Kolom (Indexing):
     * '++id': Primary key auto-increment.
     * '&username': Diindeks dan harus unik (tidak boleh ada username yang sama).
     */
    pengguna: '++id, &username'
});

// Pesan konfirmasi di console browser untuk memastikan script ini berjalan.
console.log("Database 'SuperDesaDB' berhasil didefinisikan.");

