<script lang="ts">
    import { getConstituencyByNo, getConstituencyLocations, getEDLocationsByConst, getEDsByConst } from '$lib/firebase/getters';
	import type { Election } from '$lib/firebase/types';
    import { itemsToGeoJSON, itemToGeoJSON } from '$lib/geojson';
  import { onMount } from 'svelte';

  export let election: Election; // <-- declare prop

  let showPollingDivisions = false;
  let showElectoralDivisions = false;

  let mapContainer: HTMLDivElement;

  onMount(async () => {
    const L = (await import('leaflet')).default;

    const constituencyId = String(election?.constituency_id);

    if (!constituencyId) {
      console.error('Constituency ID is missing');
      return;
    }

    const electoral_division_data = await getEDsByConst(constituencyId);
    const electoral_divisions_map = new Map(electoral_division_data.map(ed => [ed.ed_no, ed]));

    const constituencyLocations = await getConstituencyLocations(constituencyId);

    if (!constituencyLocations) {
      console.error('Constituency not found');
      return;
    }

    const constituencyGeoJSON = itemsToGeoJSON(constituencyLocations);

    const map = L.map(mapContainer)

    const electoralDivisionLocations = await getEDLocationsByConst(constituencyId);

    console.log("EDs:", electoralDivisionLocations, constituencyId);

    const electoralDivisionsGeoJson = itemsToGeoJSON(electoralDivisionLocations);

    console.log("EDs GeoJSON:", electoralDivisionsGeoJson);

    L.geoJSON(electoralDivisionsGeoJson, {
      style: feature => ({
        color: '#2C3E50',      // dark navy border
        weight: 1.5,           // thin stroke
        fillColor: '#3498DB',  // muted blue fill
        fillOpacity: 0.3,
        opacity: 1
      }),
      onEachFeature: (feature, layer) => {
        const ed = electoral_divisions_map.get(feature.properties.ed_no);
        layer.bindPopup(`<strong>${ed?.const_name}</strong>`);

        layer.on({
          mouseover: () => {
            layer.setStyle({
              weight: 3,
              color: '#1ABC9C',     // teal border on hover
              fillColor: '#5DADE2', // brighter blue fill
              fillOpacity: 0.5
            });
            layer.bringToFront(); // keep highlight above others
          },
          mouseout: () => {
            layer.setStyle({
              weight: 1.5,
              color: '#2C3E50',     // reset to dark navy border
              fillColor: '#3498DB', // reset fill
              fillOpacity: 0.3
            });
          },
        });
      }
    }).addTo(map);

    map.on('click', (e) => {
      console.log('Map clicked at', e.latlng);
    });

    // L.geoJSON(constituencyGeoJSON, {
    //   style: {
    //     color: '#3388ff',
    //     weight: 2,
    //     opacity: 1,
    //     fillOpacity: 0.2
    //   }
    // }).addTo(map);

    // auto set view to fit the constituency
    map.fitBounds(L.geoJSON(constituencyGeoJSON).getBounds());


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  });
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
      <label class="inline-flex items-center mr-4">
        <input type="checkbox" bind:checked={showPollingDivisions} class="form-checkbox" />
        <span class="ml-2">Show Polling Divisions</span>
      </label>
      <label class="inline-flex items-center">
        <input type="checkbox" bind:checked={showElectoralDivisions} class="form-checkbox" />
        <span class="ml-2">Show Electoral Divisions</span>
      </label>
    </div>

  <div bind:this={mapContainer} class="w-full h-[600px] rounded shadow-lg"></div>
</main>
