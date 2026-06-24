import { supabase } from './api.js';
import { initMap } from './map.js';

const { map, marker } = initMap();

const TARIFF_BASE = 10000;
const TARIFF_PER_KM = 2500;

function calculatePrice(km) {
    return TARIFF_BASE + (km * TARIFF_PER_KM);
}

// Geolocation otomatis
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        map.setView([lat, lng], 15);

        marker.setLatLng([lat, lng]);

    });
}

// Submit Order
document.getElementById('form-pesan').addEventListener('submit', async (e) => {

    e.preventDefault();

    const pos = marker.getLatLng();

    const nama = document.getElementById('in-nama').value;
    const jemput = document.getElementById('in-jemput').value;
    const tujuan = document.getElementById('in-tujuan').value;

    const harga = calculatePrice(3);

    document.getElementById('est-harga').innerText =
        `Rp ${harga.toLocaleString('id-ID')}`;

    const { error } = await supabase
        .from('orders')
        .insert([
            {
                nama,
                jemput,
                tujuan,
                pickup_lat: pos.lat,
                pickup_lng: pos.lng,
                price: harga,
                service_type: 'ojek',
                status: 'baru'
            }
        ]);

    if (error) {
        alert(error.message);
        return;
    }

    alert('Driver sedang dicari...');
});
