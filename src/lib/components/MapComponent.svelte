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

    const constituency = await getConstituencyLocations(constituencyId);

    if (!constituency) {
      console.error('Constituency not found');
      return;
    }

    const constituencyGeoJSON = itemsToGeoJSON(constituency);

    const map = L.map(mapContainer);

    if (true) {
        const electoralDivisions = await getEDLocationsByConst(constituencyId);

        console.log("EDs:", electoralDivisions, constituencyId);

        const electoralDivisionsGeoJson = itemsToGeoJSON(electoralDivisions);

        console.log("EDs GeoJSON:", electoralDivisionsGeoJson);

        L.geoJSON(electoralDivisionsGeoJson, {
        style: (feature) => ({
            color: '#ff7800',   // stroke color (border)
            weight: 2,          // stroke width
            opacity: 1,
            fillColor: '#ffaa00', // fill color
            fillOpacity: 0.5
        }),
        onEachFeature: (feature, layer) => {
            // Make each feature clickable
            layer.on({
            
            click: () => {
                console.log('Clicked feature:', feature.properties);
                layer.bindPopup(`<strong>${feature.properties.ed_name}</strong>`).openPopup();
            },
            mouseover: () => {
                layer.setStyle({ weight: 4 }); // highlight on hover
            },
            mouseout: () => {
                layer.setStyle({ weight: 2 }); // reset on hover out
            }
            });
        }
        }).addTo(map);
    }

    L.geoJSON(constituencyGeoJSON, {
      style: {
        color: '#3388ff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.2
      }
    }).addTo(map);

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
