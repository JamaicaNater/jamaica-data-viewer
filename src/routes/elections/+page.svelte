<script lang="ts">
  import { onMount } from 'svelte';
  import type { Election } from '$lib/firebase/types';
  import { getElections } from '$lib/firebase/getters';

  let elections: Election[] = [];
  let loading = true;
  let error: string | null = null;

  // Replace with a default constituency ID for demo
  const defaultConstId = '1'; 

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

<main class="p-6">
  <h1 class="text-2xl font-bold mb-4">Elections</h1>

  {#if loading}
    <p>Loading elections...</p>
  {:else if error}
    <p class="text-red-600">{error}</p>
  {:else if elections.length === 0}
    <p>No elections found.</p>
  {:else}
    <ul class="space-y-2">
      {#each elections as election}
        <li class="border p-3 rounded hover:bg-gray-50">
          <div class="font-semibold">{election.name}</div>
          <div class="text-sm text-gray-600">
            Type: {election.type} | Date: {new Date(election.date).toLocaleDateString()}
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  <a href="/" class="mt-4 inline-block text-blue-600 hover:underline">Back to Home</a>
</main>
