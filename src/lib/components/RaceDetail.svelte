<script lang="ts">
  import type { ElectionRace } from '$lib/firebase/types';
  export let race: ElectionRace;
  export let onBack: () => void;

  function goBack() {
    onBack?.();
  }
</script>

<div class="bg-white border rounded-lg p-6 shadow">
  <button
    type="button"
    class="mb-4 px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
    on:click={goBack}
  >
    ← Back
  </button>

  <h2 class="text-2xl font-bold text-gray-800">
    {race.constituency_name} ({race.constituency_id})
  </h2>

  <p class="text-gray-600 mt-2">
    Results for {race.results.length} polling stations
  </p>

  {#if race.results.length > 0}
    <div class="mt-4 max-h-96 overflow-y-auto border rounded p-2 bg-gray-50">
      <ul class="space-y-2">
        {#each race.results as res}
          <li class="p-2 border rounded bg-white">
            Polling Division {res.polling_division}: {res.total_votes} votes
          </li>
        {/each}
      </ul>
    </div>
  {:else}
    <p class="mt-4 text-gray-500">No results yet.</p>
  {/if}
</div>
