// assets/js/data_warga.js
const dataWargaState = { currentPage: 1, rowsPerPage: 10, searchTerm: '', totalRows: 0 };

function initDataWargaPage() {
    loadWargaData();
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            dataWargaState.searchTerm = e.target.value;
            dataWargaState.currentPage = 1;
            loadWargaData();
        }, 300);
    });
    setupActionModalsAndButtons();
}

async function loadWargaData() {
    const tableBody = document.getElementById('warga-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Memuat data...</p></td></tr>`;

    try {
        let collection = db.warga;
        if (dataWargaState.searchTerm) {
            const term = dataWargaState.searchTerm.toLowerCase();
            collection = collection.filter(warga => (warga.nik && String(warga.nik).toLowerCase().includes(term)) || (warga.nama && warga.nama.toLowerCase().includes(term)));
        }
        dataWargaState.totalRows = await collection.count();
        const dataToShow = await collection.offset((dataWargaState.currentPage - 1) * dataWargaState.rowsPerPage).limit(dataWargaState.rowsPerPage).toArray();
        renderWargaTable(dataToShow);
        renderWargaPagination();
    } catch (error) {
        console.error("Gagal memuat data warga:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-500">Gagal memuat data.</td></tr>`;
    }
}

function renderWargaTable(data) {
    const tableBody = document.getElementById('warga-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Tidak ada data yang ditemukan.</td></tr>`;
        return;
    }
    const startIndex = (dataWargaState.currentPage - 1) * dataWargaState.rowsPerPage;
    data.forEach((warga, index) => {
        // PERBAIKAN: Menghapus koma pada format alamat
        const alamatLengkap = `${warga.alamat || ''} RT ${warga.rt || '-'} / RW ${warga.rw || '-'}`;
        const row = `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-4 text-gray-700">${startIndex + index + 1}</td>
                <td class="p-4 text-gray-700 font-medium">${warga.nik || '-'}</td>
                <td class="p-4 text-gray-700">${warga.nama || '-'}</td>
                <td class="p-4 text-gray-700">${alamatLengkap}</td>
                <td class="p-4 text-center">
                    <button class="view-btn text-blue-600 hover:text-blue-800 p-1" data-id="${warga.id}" title="Lihat Detail"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn text-green-600 hover:text-green-800 p-1 ml-2" data-id="${warga.id}" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-btn text-red-600 hover:text-red-800 p-1 ml-2" data-id="${warga.id}" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}

function renderWargaPagination() {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    const totalPages = Math.ceil(dataWargaState.totalRows / dataWargaState.rowsPerPage);
    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }
    const startRow = (dataWargaState.currentPage - 1) * dataWargaState.rowsPerPage + 1;
    const endRow = Math.min(startRow + dataWargaState.rowsPerPage - 1, dataWargaState.totalRows);
    paginationControls.innerHTML = `
        <span class="text-sm text-gray-600">Menampilkan ${startRow} - ${endRow} dari ${dataWargaState.totalRows} data</span>
        <div>
            <button id="prev-page" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg" ${dataWargaState.currentPage === 1 ? 'disabled' : ''}>Sebelumnya</button>
            <button id="next-page" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg" ${dataWargaState.currentPage === totalPages ? 'disabled' : ''}>Berikutnya</button>
        </div>`;
    document.getElementById('prev-page')?.addEventListener('click', () => { if (dataWargaState.currentPage > 1) { dataWargaState.currentPage--; loadWargaData(); } });
    document.getElementById('next-page')?.addEventListener('click', () => { if (dataWargaState.currentPage < totalPages) { dataWargaState.currentPage++; loadWargaData(); } });
}

function setupActionModalsAndButtons() {
    const tableBody = document.getElementById('warga-table-body');
    const viewModal = document.getElementById('view-warga-modal');
    const closeModalBtn = document.getElementById('close-view-modal');
    const closeModalFooterBtn = document.getElementById('close-view-modal-footer');
    
    if (!tableBody || !viewModal || !closeModalBtn || !closeModalFooterBtn) return;

    const closeModal = () => viewModal.classList.add('hidden');
    closeModalBtn.addEventListener('click', closeModal);
    closeModalFooterBtn.addEventListener('click', closeModal);
    
    tableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const viewButton = target.closest('.view-btn');
        const editButton = target.closest('.edit-btn');
        const deleteButton = target.closest('.delete-btn');

        if (viewButton) {
            showWargaDetails(Number(viewButton.dataset.id));
        }

        if (editButton) {
            const wargaId = editButton.dataset.id;
            window.location.hash = `#/edit_warga?id=${wargaId}`;
        }

        if (deleteButton) {
            const wargaId = Number(deleteButton.dataset.id);
            const warga = await db.warga.get(wargaId);
            if (confirm(`Yakin ingin menghapus data:\n${warga.nama} (NIK: ${warga.nik})?`)) {
                await db.warga.delete(wargaId);
                loadWargaData();
            }
        }
    });
}

function formatTanggalIndonesia(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '-';
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const [tahun, bulanIndex, tanggal] = isoDate.split('-');
    return `${parseInt(tanggal, 10)} ${bulan[parseInt(bulanIndex, 10) - 1]} ${tahun}`;
}

async function showWargaDetails(id) {
    try {
        const warga = await db.warga.get(id);
        if (!warga) return alert('Data warga tidak ditemukan.');

        const modalBody = document.getElementById('modal-content-body');
        const modal = document.getElementById('view-warga-modal');
        
        const detailItem = (label, value) => `<div class="border-b py-2"><p class="text-sm text-gray-500">${label}</p><p class="font-semibold">${value || '-'}</p></div>`;
        
        // PERBAIKAN: Menghapus koma pada format alamat
        const alamatLengkap = `${warga.alamat || ''} RT ${warga.rt || '-'} / RW ${warga.rw || '-'}`;

        modalBody.innerHTML = `
            ${detailItem('NIK', warga.nik)}
            ${detailItem('Nama Lengkap', warga.nama)}
            ${detailItem('Nomor KK', warga.nomor_kk)}
            ${detailItem('Tempat, Tanggal Lahir', `${warga.tempat_lahir || ''}, ${formatTanggalIndonesia(warga.tanggal_lahir)}`)}
            ${detailItem('Jenis Kelamin', warga.jenis_kelamin)}
            ${detailItem('Alamat', alamatLengkap)}
            ${detailItem('Agama', warga.agama)}
            ${detailItem('Pendidikan Terakhir', warga.pendidikan)}
            ${detailItem('Pekerjaan', warga.pekerjaan)}
            ${detailItem('Status Perkawinan', warga.status)}
            ${detailItem('Nama Ayah', warga.nama_ayah)}
            ${detailItem('Nama Ibu', warga.nama_ibu)}
        `;
        
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Gagal menampilkan detail warga:', error);
    }
}
