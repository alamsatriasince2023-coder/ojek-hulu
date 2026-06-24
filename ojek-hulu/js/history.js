import { supabase } from './api.js';

export async function loadHistory(userName) {
    // Mengambil data berdasarkan nama (atau nanti berdasarkan UserID)
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('nama', userName)
        .order('created_at', { ascending: false });

    if (error) return console.error("Gagal ambil riwayat:", error);

    const historyContainer = document.getElementById('list-riwayat');
    if (historyContainer) {
        historyContainer.innerHTML = data.map(o => `
            <div class="bg-white p-4 rounded-xl border mb-2 flex justify-between">
                <div>
                    <p class="font-bold">${o.tujuan || 'Tujuan'} </p>
                    <p class="text-xs text-gray-500">${new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <p class="font-bold text-green-600">Rp ${o.harga?.toLocaleString() || 0}</p>
            </div>
        `).join('');
    }
}