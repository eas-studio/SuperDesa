// assets/js/tambah_warga.js

function initTambahWargaPage() {
    const form = document.getElementById('form-tambah-warga');
    if (form) form.addEventListener('submit', simpanDataWarga);

    const importButton = document.getElementById('btn-import-csv');
    const fileInput = document.getElementById('import-csv');
    if (importButton && fileInput) {
        importButton.addEventListener('click', () => handleImport(importButton, fileInput));
    }

    if (document.getElementById('delete-modal')) {
        setupDeleteModal();
    }
}

async function simpanDataWarga(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const dataWarga = {};
    for (let [key, value] of formData.entries()) {
        dataWarga[key] = value.trim();
    }

    if (!dataWarga.nik || !dataWarga.nama) {
        alert('Kesalahan: NIK dan Nama Lengkap wajib diisi!');
        return;
    }

    try {
        await db.warga.add(dataWarga);
        alert(`Data warga dengan NIK ${dataWarga.nik} berhasil disimpan!`);
        window.location.hash = '#/data_warga';
    } catch (error) {
        console.error('Gagal menyimpan data warga:', error);
        if (error.name === 'ConstraintError') {
            alert('Gagal menyimpan! NIK ini sudah terdaftar di database.');
        } else {
            alert('Terjadi kesalahan yang tidak diketahui saat menyimpan data.');
        }
    }
}

async function handleImport(importButton, fileInput) {
    if (fileInput.files.length === 0) {
        alert('Silakan pilih file CSV terlebih dahulu.');
        return;
    }
    const file = fileInput.files[0];
    
    importButton.disabled = true;
    importButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mengimpor...';

    const correctKeys = [
        'nik', 'nomor_kk', 'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 
        'agama', 'status', 'hubungan_keluarga', 'kepala_keluarga', 'pendidikan', 
        'pekerjaan', 'nama_ibu', 'nama_ayah', 'alamat', 'rt', 'rw'
    ];

    Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: async (results) => {
            let dataAsArray = results.data;
            if (dataAsArray.length > 0 && isNaN(parseInt(dataAsArray[0][0], 10))) {
                dataAsArray.shift();
            }
            
            if (!dataAsArray || dataAsArray.length === 0) {
                alert('File CSV kosong atau formatnya tidak sesuai.');
                importButton.disabled = false;
                importButton.innerHTML = '<i class="fas fa-upload mr-2"></i>Import';
                return;
            }

            const processedData = dataAsArray.map(rowArray => {
                const obj = {};
                correctKeys.forEach((key, index) => {
                    if (rowArray[index] !== undefined && rowArray[index] !== null) {
                        obj[key] = String(rowArray[index]).trim();
                    }
                });
                if (obj.jenis_kelamin) {
                    const jk = obj.jenis_kelamin.toUpperCase();
                    if (jk === 'L') obj.jenis_kelamin = 'Laki-laki';
                    if (jk === 'P') obj.jenis_kelamin = 'Perempuan';
                }
                if (obj.tempat_lahir) obj.tempat_lahir = toProperCase(obj.tempat_lahir);
                if (obj.alamat) obj.alamat = toProperCase(obj.alamat);
                if (obj.tanggal_lahir) {
                    const parts = obj.tanggal_lahir.split(/[-/.]/);
                    if (parts.length === 3) {
                        let [day, month, year] = parts;
                        if(day.length === 4) [year, month, day] = parts;
                        if (year && month && day && year.length === 4) {
                            obj.tanggal_lahir = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        }
                    }
                }
                return obj;
            }).filter(obj => obj.nik && obj.nama);

            let successCount = 0;
            let failedCount = 0;
            const duplicateNiks = [];

            for (const data of processedData) {
                try {
                    await db.warga.add(data);
                    successCount++;
                } catch (error) {
                    if (error.name === 'ConstraintError') {
                        failedCount++;
                        duplicateNiks.push(data.nik);
                    }
                }
            }

            let reportMessage = `Proses impor selesai.\n\n- Berhasil: ${successCount}\n`;
            if (failedCount > 0) {
                reportMessage += `- Gagal (NIK duplikat): ${failedCount}\n- NIK: ${duplicateNiks.join(', ')}\n`;
            }
            
            alert(reportMessage);
            if(successCount > 0) {
                window.location.hash = '#/data_warga';
            }

            importButton.disabled = false;
            importButton.innerHTML = '<i class="fas fa-upload mr-2"></i>Import';
            fileInput.value = '';
        }
    });
}

function setupDeleteModal() {
    const deleteButton = document.getElementById('hapus-database');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteConfirmInput = document.getElementById('delete-confirm-input');

    if (!deleteButton || !deleteModal || !cancelDeleteBtn || !confirmDeleteBtn || !deleteConfirmInput) return;

    deleteButton.addEventListener('click', () => deleteModal.classList.remove('hidden'));
    
    const closeModal = () => {
        deleteModal.classList.add('hidden');
        deleteConfirmInput.value = '';
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
    };

    cancelDeleteBtn.addEventListener('click', closeModal);

    deleteConfirmInput.addEventListener('input', () => {
        if (deleteConfirmInput.value === 'HAPUS') {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            await db.warga.clear();
            closeModal();
            alert('Seluruh data warga berhasil dihapus.');
            window.location.hash = '#/data_warga';
        } catch (error) {
            console.error('Gagal menghapus data warga:', error);
        }
    });
}

function toProperCase(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}
