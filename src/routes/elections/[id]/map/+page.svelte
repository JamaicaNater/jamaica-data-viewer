<script lang="ts">
    import { getConstituencyByNo } from '$lib/firebase/getters';
    import { itemToGeoJSON } from '$lib/geojson';
  import { onMount } from 'svelte';

  let mapContainer: HTMLDivElement;

  onMount(async () => {
    const L = (await import('leaflet')).default;

    const constituency = await getConstituencyByNo('1');

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
  <h1 class="text-3xl font-bold mb-4 text-center">Jamaica Map</h1>
  <div bind:this={mapContainer} class="w-full h-[600px] rounded shadow-lg"></div>
</main>
