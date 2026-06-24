export function initMap() {
    const map = L.map('map').setView([0.8443, 112.9234], 14);

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '&copy; OpenStreetMap'
        }
    ).addTo(map);

    const marker = L.marker(
        [0.8443, 112.9234],
        { draggable: true }
    ).addTo(map);

    return {
        map,
        marker
    };
}
