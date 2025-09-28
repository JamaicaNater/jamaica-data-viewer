<script lang="ts">
  import { onMount } from 'svelte';
  import { getConstituencyLocations, getEDLocationsByConst, getEDsByConst } from '$lib/firebase/getters';
  import { itemsToGeoJSON } from '$lib/geojson';
  import type { Election } from '$lib/firebase/types';

  export let election: Election;

  let selectedView: 'constituency' | 'electoral' = 'constituency';
  let mapContainer: HTMLDivElement;

  // we keep references here so the $: can access them
  let map: any;
  let constituencyLayer: any;
  let electoralLayer: any;

  onMount(async () => {
    const L = (await import('leaflet')).default;
    map = L.map(mapContainer);

    const constituencyId = String(election?.constituency_id);
    if (!constituencyId) return;

    const constituencyName = election?.constituency_name || 'Unknown Constituency';
    const constituencyGeoJSON = itemsToGeoJSON(await getConstituencyLocations(constituencyId));
    const electoralDivisionsGeoJson = itemsToGeoJSON(await getEDLocationsByConst(constituencyId));
    const electoral_division_data = await getEDsByConst(constituencyId);
    const electoral_divisions_map = new Map(electoral_division_data.map(ed => [ed.ed_no, ed]));

    constituencyLayer = L.geoJSON(constituencyGeoJSON, {
      style: { color: '#3388ff', weight: 2, opacity: 1, fillOpacity: 0.2 },

      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<strong>${constituencyName}</strong>`);
        layer.on({
          mouseover: () => layer.setStyle({ weight: 4, color: '#1ABC9C', fillOpacity: 0.4 }),
          mouseout: () => layer.setStyle({ weight: 2, color: '#3388ff', fillOpacity: 0.2 })
        });
      }
    });

    electoralLayer = L.geoJSON(electoralDivisionsGeoJson, {
      style: feature => ({
        color: '#2C3E50', weight: 1.5, fillColor: '#3498DB', fillOpacity: 0.3, opacity: 1
      }),
      onEachFeature: (feature, layer) => {
        const ed = electoral_divisions_map.get(feature.properties.ed_no);
        layer.bindPopup(`<strong>${ed?.const_name}: ${ed?.ed_name} (${ed?.ed_no})</strong>`);
        layer.on({
          mouseover: () => layer.setStyle({ weight: 3, color: '#1ABC9C', fillColor: '#5DADE2', fillOpacity: 0.5 }),
          mouseout: () => layer.setStyle({ weight: 1.5, color: '#2C3E50', fillColor: '#3498DB', fillOpacity: 0.3 })
        });
      }
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // initial view
    constituencyLayer.addTo(map);
    map.fitBounds(constituencyLayer.getBounds());
  });

  // reactive block outside onMount
  $: if (map && constituencyLayer && electoralLayer) {
    // remove both
    if (map.hasLayer(constituencyLayer)) map.removeLayer(constituencyLayer);
    if (map.hasLayer(electoralLayer)) map.removeLayer(electoralLayer);

    // add the selected one
    if (selectedView === 'constituency') {
      constituencyLayer.addTo(map);
      map.fitBounds(constituencyLayer.getBounds());
    } else if (selectedView === 'electoral') {
      electoralLayer.addTo(map);
      map.fitBounds(electoralLayer.getBounds());
    }
  }
</script>


<svelte:head>
  <title>Jamaica Map</title>
  <!-- Leaflet CSS without integrity -->
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
</svelte:head>

<main class="p-6">
    <!-- Toggle Buttons -->
  <div class="mb-4">
    <label for="view" class="mr-2 font-semibold">View:</label>
    <select id="view" bind:value={selectedView} class="border rounded p-2">
      <option value="constituency">Constituency</option>
      <option value="electoral">Electoral Divisions</option>
    </select>
  </div>

  <div bind:this={mapContainer} class="w-full h-[600px] rounded shadow-lg"></div>
</main>
