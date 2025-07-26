// assets/js/pengaturan_surat.js

function initPengaturanSuratPage() {
    const form = document.getElementById('form-pengaturan-surat');
    if (!form) return;

    loadSuratSettingsToForm();

    form.addEventListener('submit', saveSuratSettings);
}

/**
 * Mengambil data pengaturan surat dari DB dan mengisinya ke form.
 */
async function loadSuratSettingsToForm() {
    try {
        // Ambil pengaturan spesifik yang kita butuhkan
        const settingsNeeded = ['format_nomor_surat', 'font_surat', 'tampilkan_footer'];
        const settingsFromDb = await db.pengaturan.where('kunci').anyOf(settingsNeeded).toArray();

        const settingsMap = settingsFromDb.reduce((acc, setting) => {
            acc[setting.kunci] = setting.nilai;
            return acc;
        }, {});

        // Isi form dengan nilai dari DB atau nilai default jika kosong
        document.getElementById('format_nomor_surat').value = settingsMap.format_nomor_surat || '[nomor]/[kode_surat]/[bulan_romawi]/[tahun]';
        document.getElementById('font_surat').value = settingsMap.font_surat || 'Times New Roman';
        document.getElementById('tampilkan_footer').checked = settingsMap.tampilkan_footer === 'true'; // Konversi string 'true' ke boolean

    } catch (error) {
        console.error("Gagal memuat pengaturan surat:", error);
        alert("Gagal memuat data pengaturan surat.");
    }
}

/**
 * Menyimpan pengaturan surat dari form ke database.
 * @param {Event} event - Objek event dari form submission.
 */
async function saveSuratSettings(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';

    const settingsToSave = [
        { kunci: 'format_nomor_surat', nilai: form.format_nomor_surat.value },
        { kunci: 'font_surat', nilai: form.font_surat.value },
        { kunci: 'tampilkan_footer', nilai: String(form.tampilkan_footer.checked) } // Simpan boolean sebagai string 'true'/'false'
    ];

    try {
        await db.pengaturan.bulkPut(settingsToSave);
        
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Pengaturan Surat';
        alert("Pengaturan surat berhasil disimpan!");

    } catch (error) {
        console.error("Gagal menyimpan pengaturan surat:", error);
        alert("Terjadi kesalahan saat menyimpan pengaturan surat.");
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Pengaturan Surat';
    }
}
