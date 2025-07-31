async function getLocationAndDisplayStations() {
  const status = document.getElementById("status");
  const list = document.getElementById("stations-list");

  if (!navigator.geolocation) {
    status.textContent = "❌ Géolocalisation non supportée.";
    return;
  }

  status.textContent = "📍 Obtention de votre position...";

  navigator.geolocation.getCurrentPosition(async (position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    status.textContent = "🔍 Chargement des stations-service...";

    try {
      const res = await fetch("/api/carburants");
      const stations = await res.json();

      // Calcule la distance
      const stationsWithDistance = stations.map((s) => {
        const d = getDistance(userLat, userLon, s.lat, s.lon);
        return { ...s, distance: d };
      });

      // Trie les stations par distance croissante
      stationsWithDistance.sort((a, b) => a.distance - b.distance);

      // Affiche les 10 plus proches
      list.innerHTML = stationsWithDistance.slice(0, 10).map((s) => {
        const prix = s.carburants.map(c => `${c.nom}: ${c.valeur} €`).join(" | ");
        return `<li>
          <strong>${s.ville}</strong> (${s.distance.toFixed(1)} km)<br>
          ${s.adresse}<br>
          ${prix}
        </li>`;
      }).join("");

      status.textContent = `✅ ${stationsWithDistance.length} stations trouvées.`;
    } catch (err) {
      status.textContent = "❌ Erreur lors du chargement des données.";
      console.error(err);
    }
  }, () => {
    status.textContent = "❌ Impossible d’obtenir votre position.";
  });
}

// Calcule la distance entre deux points (Haversine)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toRad(deg) {
  return deg * Math.PI / 180;
}

getLocationAndDisplayStations();
