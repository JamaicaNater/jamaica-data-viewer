<script lang="ts">
    import { getConstituencyByNo } from '$lib/firebase/getters';
	import type { Election } from '$lib/firebase/types';
    import { itemToGeoJSON } from '$lib/geojson';
  import { onMount } from 'svelte';

  export let election: Election; // <-- declare prop

  let mapContainer: HTMLDivElement;

  onMount(async () => {
    const L = (await import('leaflet')).default;

    const constituencyId = String(election?.constituency_id);

    if (!constituencyId) {
      console.error('Constituency ID is missing');
      return;
    }

    const constituency = await getConstituencyByNo(constituencyId);

    if (!constituency) {
      console.error('Constituency not found');
      return;
    }

    const constituencyGeoJSON = itemToGeoJSON(constituency);

    const map = L.map(mapContainer);

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
  <div bind:this={mapContainer} class="w-full h-[600px] rounded shadow-lg"></div>
</main>
