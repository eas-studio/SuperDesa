// assets/js/pengaturan.js

function initPengaturanPage() {
    const form = document.getElementById('form-pengaturan');
    if (!form) return;

    loadSettingsToForm();
    setupLogoUpload(); // Jalankan fungsi untuk setup unggah logo

    form.addEventListener('submit', saveSettings);
}

/**
 * Fungsi untuk setup event listener pada input file logo.
 */
function setupLogoUpload() {
    const logoUploadInput = document.getElementById('logo_upload');
    const logoPreview = document.getElementById('logo-preview');

    if (!logoUploadInput || !logoPreview) return;

    logoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === "image/png") {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Tampilkan pratinjau dan simpan data base64 di elemen gambar
                logoPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert("Silakan pilih file gambar dengan format .PNG");
        }
    });
}

/**
 * Mengambil semua data dari tabel 'pengaturan' dan mengisinya ke dalam form.
 */
async function loadSettingsToForm() {
    try {
        const allSettings = await db.pengaturan.toArray();
        const settingsMap = allSettings.reduce((acc, setting) => {
            acc[setting.kunci] = setting.nilai;
            return acc;
        }, {});

        const form = document.getElementById('form-pengaturan');
        for (const element of form.elements) {
            if (element.name && settingsMap[element.name]) {
                element.value = settingsMap[element.name];
            }
        }
        
        // Muat pratinjau logo jika ada di database
        const logoPreview = document.getElementById('logo-preview');
        if (logoPreview && settingsMap['logo_desa']) {
            logoPreview.src = settingsMap['logo_desa'];
        }

    } catch (error) {
        console.error("Gagal memuat pengaturan:", error);
        alert("Gagal memuat data pengaturan yang sudah tersimpan.");
    }
}

/**
 * Mengambil semua data dari form dan menyimpannya ke database.
 * @param {Event} event - Objek event dari form submission.
 */
async function saveSettings(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';

    const settingsToSave = [];
    for (const element of form.elements) {
        if (element.name && element.type !== 'file') { // Jangan simpan input file
            settingsToSave.push({
                kunci: element.name,
                nilai: element.value
            });
        }
    }

    // Ambil data logo dari pratinjau
    const logoPreview = document.getElementById('logo-preview');
    // Hanya simpan jika src-nya adalah data base64 (bukan placeholder)
    if (logoPreview && logoPreview.src.startsWith('data:image')) {
        settingsToSave.push({
            kunci: 'logo_desa',
            nilai: logoPreview.src
        });
    }

    try {
        await db.pengaturan.bulkPut(settingsToSave);
        
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Pengaturan';
        alert("Pengaturan berhasil disimpan!");

    } catch (error) {
        console.error("Gagal menyimpan pengaturan:", error);
        alert("Terjadi kesalahan saat menyimpan pengaturan.");
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Pengaturan';
    }
}
