// assets/js/app.js

const routes = {
    'dashboard': { path: 'pages/dashboard.html', title: 'Dashboard', init: 'initDashboardPage' },
    'data_warga': { path: 'pages/data_warga.html', title: 'Manajemen Data Warga', init: 'initDataWargaPage' },
    'tambah_warga': { path: 'pages/tambah_warga.html', title: 'Tambah Data Warga', init: 'initTambahWargaPage' },
    'edit_warga': { path: 'pages/edit_warga.html', title: 'Edit Data Warga', init: 'initEditWargaPage' },
    'pengaturan_aplikasi': { path: 'pages/pengaturan.html', title: 'Pengaturan Aplikasi', init: 'initPengaturanPage' },
    'pengaturan_surat': { path: 'pages/pengaturan_surat.html', title: 'Pengaturan Surat', init: 'initPengaturanSuratPage' },
    'pembuatan_surat': { path: 'pages/pembuatan_surat.html', title: 'Pilih Jenis Surat', init: 'initPembuatanSuratPage' },
    // PENAMBAHAN: Rute dinamis untuk halaman pembuatan surat spesifik
    'buat_surat': { path: 'pages/buat_surat.html', title: 'Buat Surat', init: 'initBuatSuratPage' },
};

async function loadPage(pageKey, params = null) {
    const contentContainer = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    
    const route = routes[pageKey];
    if (!route) {
        contentContainer.innerHTML = '<h1 class="text-4xl text-red-500">Error 404: Halaman tidak ditemukan.</h1>';
        return;
    }

    try {
        const response = await fetch(route.path + '?v=' + new Date().getTime());
        if (!response.ok) throw new Error('Gagal memuat halaman.');
        
        const pageHtml = await response.text();
        contentContainer.innerHTML = pageHtml;
        pageTitle.textContent = route.title;

        if (route.init && typeof window[route.init] === 'function') {
            // Kirim parameter ke fungsi init jika ada
            window[route.init](params);
        }

        updateActiveNav(pageKey);

    } catch (error) {
        console.error('Error memuat halaman:', error);
        contentContainer.innerHTML = '<h1 class="text-4xl text-red-500">Gagal memuat konten.</h1>';
    }
}

function handleNavigation() {
    let fullPath = window.location.hash.substring(2); // Hapus '#/'
    let pathParts = fullPath.split('?');
    let path = pathParts[0];
    let queryParams = new URLSearchParams(pathParts[1] || '');
    
    let pageKey = path.split('/')[0]; // Ambil bagian pertama (e.g., 'buat_surat')
    let pathParams = path.split('/').slice(1); // Ambil sisanya sebagai parameter

    // Gabungkan parameter dari path dan query string
    const params = {
        path: pathParams,
        query: queryParams
    };

    const finalPageKey = routes[path] ? path : pageKey;

    loadPage(finalPageKey, params);
}

function updateActiveNav(currentRoute) {
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const routeAttr = link.dataset.route;

        if (routeAttr === currentRoute) {
            link.classList.add('active');
        } 
        else if (routeAttr === 'data_warga' && (currentRoute === 'tambah_warga' || currentRoute === 'edit_warga')) {
            link.classList.add('active');
        }
        // Aturan baru: Aktifkan menu "Pembuatan Surat" saat berada di halaman buat surat
        else if (routeAttr === 'pembuatan_surat' && currentRoute === 'buat_surat') {
            link.classList.add('active');
        }
    });
}


window.addEventListener('hashchange', handleNavigation);
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('hidden');
    });
    handleNavigation();
});
