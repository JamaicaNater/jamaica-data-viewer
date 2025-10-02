<script lang="ts">
  import { onMount } from 'svelte';
  import { getEDLocationsByConst, getEDsByConst, getPollingDivisionLocationsByConstituency } from '$lib/firebase/getters';
  import { itemsToGeoJSON } from '$lib/geojson';
  import type { Election, ElectionRace } from '$lib/firebase/types';
	import { fetchAllFilesInDir, fetchFile, listFilesWithDepth } from '$lib/firebase/storage';

  export let races: ElectionRace[];

  let selectedView: 'constituency' | 'electoral' | 'polling' = 'constituency';
  let mapContainer: HTMLDivElement;

  // we keep references here so the $: can access them
  let map: any;
  let constituencyLayer: any;
  let electoralLayer: any;
  let pollingDivisionLayer: any;

  onMount(async () => {
    const L = (await import('leaflet')).default;
    map = L.map(mapContainer);

    console.log('Races prop:', races);

    let firstRace = races[0];

    const constituencyId = String(firstRace?.constituency_no);
    if (!constituencyId) return;

    const constituencyName = firstRace?.constituency_name || 'Unknown Constituency';

    

    const electoralDivisionsFiles = await listFilesWithDepth(`maps/2010/constituencies/${constituencyId}/electoral_divisions/`);
    console.log('Files in constituency directory:', electoralDivisionsFiles);

    const rawConstituencyData = await fetchFile(`maps/2010/constituencies/${constituencyId}.geojson`);
    const text = new TextDecoder().decode(rawConstituencyData);
    const constituencyGeoJSON = JSON.parse(text);

    const EDGeoJsons: any[] = [];
    const rawEDData = await fetchAllFilesInDir(`maps/2010/constituencies/${constituencyId}/electoral_divisions/`);
    for (const [fileName, data] of Object.entries(rawEDData)) {
      console.log(`ED File: ${fileName}`, new TextDecoder().decode(data));
      EDGeoJsons.push(JSON.parse(new TextDecoder().decode(data)));
    }

    console.log('Constituency GeoJSON:', constituencyGeoJSON);

    const electoralDivisionsGeoJson = itemsToGeoJSON(await getEDLocationsByConst(constituencyId));
    const pollingDivisionsGeoJson = itemsToGeoJSON(await getPollingDivisionLocationsByConstituency(constituencyId));
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

    electoralLayer = L.geoJSON(EDGeoJsons, {
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

    // pollingDivisionLayer = L.geoJSON(pollingDivisionsGeoJson, {
    //   style: feature => ({
    //     color: '#27AE60', weight: 1, fillColor: '#2ECC71', fillOpacity: 0.2, opacity: 1
    //   }),
    //   onEachFeature: (feature, layer) => {
    //     layer.bindPopup(`<strong>Polling Division: ${feature.properties.pd_no}</strong>`);
    //     layer.on({
    //       mouseover: () => layer.setStyle({ weight: 2, color: '#1ABC9C', fillColor: '#58D68D', fillOpacity: 0.4 }),
    //       mouseout: () => layer.setStyle({ weight: 1, color: '#27AE60', fillColor: '#2ECC71', fillOpacity: 0.2 })
    //     });
    //   }
    // });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // initial view
    constituencyLayer.addTo(map);
    map.fitBounds(constituencyLayer.getBounds());
  });

  // reactive block outside onMount
  $: if (map && constituencyLayer && electoralLayer && pollingDivisionLayer) {
    // remove all layers
    if (map.hasLayer(constituencyLayer)) map.removeLayer(constituencyLayer);
    if (map.hasLayer(electoralLayer)) map.removeLayer(electoralLayer);
    if (map.hasLayer(pollingDivisionLayer)) map.removeLayer(pollingDivisionLayer);

    // add the selected one
    if (selectedView === 'constituency') {
      constituencyLayer.addTo(map);
      map.fitBounds(constituencyLayer.getBounds());
    } else if (selectedView === 'electoral') {
      electoralLayer.addTo(map);
      map.fitBounds(electoralLayer.getBounds());
    } else if (selectedView === 'polling') {
      pollingDivisionLayer.addTo(map);
      map.fitBounds(pollingDivisionLayer.getBounds());
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
      <option value="polling">Polling Divisions</option>
    </select>
  </div>

  <div bind:this={mapContainer} class="w-full h-[600px] rounded shadow-lg"></div>
</main>
