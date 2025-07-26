// assets/js/edit_warga.js

function initEditWargaPage() {
    const form = document.getElementById('form-edit-warga');
    if (!form) return;
    loadWargaDataToForm();
    form.addEventListener('submit', saveWargaChanges);
}

function getUrlParams() {
    const hash = window.location.hash;
    const paramString = hash.split('?')[1];
    return new URLSearchParams(paramString);
}

async function loadWargaDataToForm() {
    const params = getUrlParams();
    const wargaId = Number(params.get('id'));

    if (!wargaId) {
        alert('ID warga tidak valid.');
        window.location.hash = '#/data_warga';
        return;
    }

    try {
        const warga = await db.warga.get(wargaId);
        if (!warga) {
            alert('Data warga tidak ditemukan.');
            window.location.hash = '#/data_warga';
            return;
        }
        
        // PERBAIKAN: Melengkapi semua field form
        document.getElementById('warga-id').value = warga.id;
        document.getElementById('nik').value = warga.nik || '';
        document.getElementById('nomor_kk').value = warga.nomor_kk || '';
        document.getElementById('nama').value = warga.nama || '';
        document.getElementById('jenis_kelamin').value = warga.jenis_kelamin || 'Laki-laki';
        document.getElementById('tempat_lahir').value = warga.tempat_lahir || '';
        document.getElementById('tanggal_lahir').value = warga.tanggal_lahir || '';
        document.getElementById('agama').value = warga.agama || '';
        document.getElementById('pendidikan').value = warga.pendidikan || '';
        document.getElementById('pekerjaan').value = warga.pekerjaan || '';
        document.getElementById('status').value = warga.status || 'Belum Kawin';
        document.getElementById('nama_ayah').value = warga.nama_ayah || '';
        document.getElementById('nama_ibu').value = warga.nama_ibu || '';
        document.getElementById('alamat').value = warga.alamat || '';
        document.getElementById('rt').value = warga.rt || '';
        document.getElementById('rw').value = warga.rw || '';

    } catch (error) {
        console.error('Gagal memuat data warga untuk diedit:', error);
    }
}

async function saveWargaChanges(event) {
    event.preventDefault();
    const form = event.target;
    const wargaId = Number(form.id.value);
    
    // PERBAIKAN: Melengkapi pengambilan data dari form
    const updatedData = {
        nomor_kk: form.nomor_kk.value.trim(),
        nama: form.nama.value.trim(),
        jenis_kelamin: form.jenis_kelamin.value,
        tempat_lahir: form.tempat_lahir.value.trim(),
        tanggal_lahir: form.tanggal_lahir.value,
        agama: form.agama.value.trim(),
        pendidikan: form.pendidikan.value.trim(),
        pekerjaan: form.pekerjaan.value.trim(),
        status: form.status.value,
        nama_ayah: form.nama_ayah.value.trim(),
        nama_ibu: form.nama_ibu.value.trim(),
        alamat: form.alamat.value.trim(),
        rt: form.rt.value.trim(),
        rw: form.rw.value.trim(),
    };

    try {
        await db.warga.update(wargaId, updatedData);
        alert('Perubahan data warga berhasil disimpan!');
        window.location.hash = '#/data_warga'; // Kembali ke daftar
    } catch (error) {
        console.error('Gagal menyimpan perubahan:', error);
        alert('Gagal menyimpan perubahan.');
    }
}
