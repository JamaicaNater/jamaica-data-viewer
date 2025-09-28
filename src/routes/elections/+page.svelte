<script lang="ts">
  import { onMount } from 'svelte';
  import type { Election } from '$lib/firebase/types';
  import { getElections } from '$lib/firebase/getters';
	import { buildElectionName } from '$lib/helpers/format';

  let elections: Election[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      elections = await getElections();
    } catch (e) {
      console.error(e);
      error = 'Failed to load elections.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Elections</title>
</svelte:head>

<main class="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
  <div class="w-full max-w-3xl">
    <h1 class="text-4xl font-extrabold text-gray-800 mb-6 text-center">
      Elections
    </h1>

    {#if loading}
      <p class="text-gray-500 text-center">Loading elections...</p>
    {:else if error}
      <p class="text-red-600 text-center">{error}</p>
    {:else if elections.length === 0}
      <p class="text-gray-600 text-center">No elections found.</p>
    {:else}
      <ul class="space-y-4">
        {#each elections as election}
          <li class="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-lg transition-shadow duration-200">
            <a href={`/elections/${election._id}`} class="font-semibold text-lg text-gray-800">{buildElectionName(election)}</a>
            <div class="text-sm text-gray-500 mt-1">
              Type: <span class="font-medium">{election.type}</span> | Date: <span class="font-medium">{new Date(election.date).toLocaleDateString()}</span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    <div class="mt-6 text-center">
      <a href="/" class="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-300">
        Back to Home
      </a>
    </div>
  </div>
</main>
