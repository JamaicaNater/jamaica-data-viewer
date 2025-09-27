<script lang="ts">
  import { onMount } from 'svelte';
  import type { Election, ElectionCandidate, ElectionResult } from '$lib/firebase/types';
  import { getElectionById, getElectionResults, getElectionCandidates } from '$lib/firebase/getters';
  import { page } from '$app/state';
	import { circIn } from 'svelte/easing';

  let election: Election | null = null;
  let results: ElectionResult[] = [];
  let candidates: ElectionCandidate[] = [];
  let candidatesMap = new Map<string, ElectionCandidate>();
  let loading = true;
  let error: string | null = null;

  let activeTab: 'results' | 'candidates' = 'results';

  onMount(async () => {
    try {
      const id = page.params.id; // updated for Svelte 5
      if (!id) {
        throw new Error('Election ID is missing in the URL.');
      }
      
      election = await getElectionById(id);
      results = await getElectionResults(id);
      candidates = await getElectionCandidates(id);

      candidates.forEach(c => {
        if (c._id) {
            candidatesMap.set(c._id, c);
        }
      });

      console.log("Candidates Map:", candidatesMap);
    } catch (e) {
      console.error(e);
      error = 'Failed to load election details.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{election?.name || "Election Details"}</title>
</svelte:head>

<main class="max-w-5xl mx-auto p-6">
  {#if loading}
    <p class="text-gray-500 text-center">Loading election details...</p>
  {:else if error}
    <p class="text-red-600 text-center">{error}</p>
  {:else if election}
    <a href={`/elections/${election._id}/map`} class="inline-block mb-4 text-blue-600 hover:underline">View Map for {JSON.stringify(election)}</a>
    <!-- Election Header -->
    <div class="mb-6 text-center">
      <h1 class="text-4xl font-bold text-gray-800">{election.name}</h1>
      <p class="text-gray-600 mt-2">{election.type.replace('_', ' ')} | {new Date(election.date).toLocaleDateString()}</p>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-6">
      <button
        class="px-4 py-2 -mb-px font-medium border-b-2 transition-colors duration-200"
        class:border-blue-600={activeTab === 'results'}
        class:text-blue-600={activeTab === 'results'}
        class:text-gray-500={activeTab !== 'results'}
        class:border-transparent={activeTab !== 'results'}
        on:click={() => activeTab = 'results'}
      >
        Results
      </button>

      <button
        class="px-4 py-2 -mb-px font-medium border-b-2 transition-colors duration-200"
        class:border-blue-600={activeTab === 'candidates'}
        class:text-blue-600={activeTab === 'candidates'}
        class:text-gray-500={activeTab !== 'candidates'}
        class:border-transparent={activeTab !== 'candidates'}
        on:click={() => activeTab = 'candidates'}
      >
        Candidates
      </button>
    </div>

    <!-- Tab Content -->
    {#if activeTab === 'results'}
      {#if results.length === 0}
        <p class="text-gray-600">No results available.</p>
      {:else}
        <div class="space-y-4">
          {#each results as r}
            <div class="bg-white border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
              <div class="font-semibold text-gray-800">Division: {r.polling_division} | Station: {r.polling_station}</div>
              <div class="text-sm text-gray-500 mt-1">
                Total Votes: {r.total_votes} | Rejected: {r.ballots_rejected} | Electors: {r.electors_on_list}
              </div>
            {#if r.candidate_results?.length}
            <ul class="mt-2 space-y-1">
                {#each r.candidate_results.filter(c => c != null) as c}
                <li class="flex justify-between text-gray-700">
                    <span>Name: {candidatesMap.get(c.candidate_id)?.first_name} {candidatesMap.get(c.candidate_id)?.last_name}, Votes: {c.votes}</span>
                </li>
                {/each}
            </ul>
            {/if}
            </div>
          {/each}
        </div>
      {/if}
    {:else if activeTab === 'candidates'}
      {#if candidates.length === 0}
        <p class="text-gray-600">No candidates available.</p>
      {:else}
        <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left px-4 py-2">Name</th>
              <th class="text-left px-4 py-2">Party</th>
              <th class="text-left px-4 py-2">Ballot Order</th>
              <th class="text-left px-4 py-2">Votes</th>
            </tr>
          </thead>
          <tbody>
            {#each candidates as c, i}
              <tr class="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-2">{c.first_name} {c.middle_name ? c.middle_name + ' ' : ''}{c.last_name} {c.alias ? `(${c.alias})` : ''}</td>
                <td class="px-4 py-2">{c.party || 'Independent'}</td>
                <td class="px-4 py-2">{c.ballot_order}</td>
                <td class="px-4 py-2 font-semibold">{c.votes}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    {/if}
  {/if}
</main>
