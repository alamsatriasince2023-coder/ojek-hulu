import { supabase } from './api.js';
import { initMap } from './map.js';
import { loginUser } from './auth.js';
import { loadHistory } from './history.js';

const marker = initMap();
let user = null;

// Navigasi
document.getElementById('nav-p').onclick = () => {
    document.getElementById('panel-p').classList.remove('hidden');
    document.getElementById('panel-d').classList.add('hidden');
    document.getElementById('panel-login').classList.add('hidden');
};

document.getElementById('nav-d').onclick = () => {
    document.getElementById('panel-p').classList.add('hidden');
    if (!user) document.getElementById('panel-login').classList.remove('hidden');
    else document.getElementById('panel-d').classList.remove('hidden');
};

// Login Action
document.getElementById('btn-login').onclick = async () => {
    const { data, error } = await loginUser(
        document.getElementById('email-d').value,
        document.getElementById('pass-d').value
    );
    if (error) alert("Gagal!");
    else { user = data.user; location.reload(); }
};

// Pesan
document.getElementById('form-pesan').onsubmit = async (e) => {
    e.preventDefault();
    const pos = marker.getLatLng();
    await supabase.from('orders').insert([{
        nama: document.getElementById('in-nama').value,
        lat: pos.lat, lng: pos.lng, status: 'baru'
    }]);
    alert('Order terkirim!');
};

// Tambahkan fungsi loadOrders ke main.js
async function loadOrders() {
    const { data } = await supabase.from('orders').select('*').eq('status', 'baru');
    const container = document.getElementById('list-order');
    if (!container) return;
    
    container.innerHTML = (data || []).map(o => `
        <div class="bg-white p-5 rounded-2xl shadow-sm border-l-8 border-green-500">
            <p class="font-bold">${o.nama}</p>
            <button onclick="ambilOrder('${o.id}')" class="w-full mt-3 py-2 bg-black text-white rounded-xl font-bold">Ambil</button>
        </div>
    `).join('');
}

// Fungsi Ambil Order
window.ambilOrder = async (id) => {
    await supabase.from('orders').update({ status: 'diambil', driver_id: user.id }).eq('id', id);
    alert('Order berhasil diambil!');
    loadOrders();
};

// Fitur Real-time (Sihir otomatis muncul order)
supabase.channel('orders').on('postgres_changes', { 
    event: 'INSERT', schema: 'public', table: 'orders' 
}, () => {
    loadOrders();
    // Tambahkan notifikasi suara
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
}).subscribe();

// Fungsi Hitung Harga Dinamis
window.hitungHargaDinamis = (km) => {
    const hargaDasar = 5000;
    const hargaPerKm = 3000;
    
    // Logika Jam Sibuk (Surge Pricing)
    const jamSekarang = new Date().getHours();
    let pengali = 1.0; 

    // Contoh: Jam 12:00 - 13:00 (Makan Siang) & 17:00 - 18:00 (Pulang Kerja)
    if ((jamSekarang >= 12 && jamSekarang < 13) || (jamSekarang >= 17 && jamSekarang < 18)) {
        pengali = 1.5; // Harga naik 50% saat jam sibuk
    }

    const total = (hargaDasar + (km * hargaPerKm)) * pengali;
    return Math.round(total);
};

document.getElementById('form-pesan').onsubmit = async (e) => {
    e.preventDefault();
    const km = document.getElementById('in-km').value;
    const totalHarga = hitungHargaDinamis(km);
    const pos = marker.getLatLng();

    await supabase.from('orders').insert([{
        nama: document.getElementById('in-nama').value,
        lat: pos.lat, 
        lng: pos.lng, 
        harga: totalHarga, // Simpan harga dinamis ke database
        status: 'baru'
    }]);
    alert('Pesanan terkirim dengan estimasi: Rp ' + totalHarga.toLocaleString());
};