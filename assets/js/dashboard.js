// assets/js/dashboard.js

async function initDashboardPage() {
    try {
        const [totalWarga, totalSurat] = await Promise.all([
            db.warga.count(),
            db.surat_tercetak.count()
        ]);
        document.getElementById('total-penduduk').textContent = totalWarga.toLocaleString('id-ID');
        document.getElementById('total-surat').textContent = totalSurat.toLocaleString('id-ID');
        document.getElementById('total-template').textContent = '0';
        document.getElementById('aktivitas-surat-body').innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">Tidak ada aktivitas terbaru.</td></tr>`;
    } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
    }
}
