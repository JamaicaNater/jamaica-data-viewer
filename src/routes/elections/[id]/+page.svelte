<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import type { Election, ElectionCandidate, ElectionRace, ElectionResult } from '$lib/firebase/types';
  import { getElectionById, getElectionResults, getElectionCandidates, getRacesByElectionId } from '$lib/firebase/getters';
  import MapComponent from '$lib/components/MapComponent.svelte'; 
  import { buildElectionName } from '$lib/helpers/format';
  import RaceDetail from '$lib/components/RaceDetail.svelte';

  // State
  let election: Election | null = null;
  let results: ElectionResult[] = [];
  let races: ElectionRace[] = [];
  let raceMap = new Map<string, ElectionRace>();

  let candidates: ElectionCandidate[] = [];
  let candidatesMap = new Map<string, ElectionCandidate>();

  let raceCandidatesMap = new Map<string, Map<number, ElectionCandidate>>();

  let loading = true;
  let error: string | null = null;

  let activeTab: 'races' | 'candidates' | 'map' = 'races';
  let selectedRace: ElectionRace | null = null;

  onMount(async () => {
    try {
      const id = $page.params.id; // ✅ updated for SvelteKit
      if (!id) {
        throw new Error('Election ID is missing in the URL.');
      }

      results = await getElectionResults(id);
      election = await getElectionById(id);

      races = await getRacesByElectionId(id);
      races.forEach(r => r._id && raceMap.set(r._id, r));

      candidates = await getElectionCandidates(id);
      candidates.forEach(c => c._id && candidatesMap.set(c._id, c));

      races.forEach(race => {
        raceCandidatesMap.set(race._id!, new Map<number, ElectionCandidate>());
      });
      candidates.forEach(candidate => {
        const raceId = candidate.race_id!;
        const candidateMap = raceCandidatesMap.get(raceId) || new Map<number, ElectionCandidate>();
        candidateMap.set(candidate.ballot_order, candidate);
        raceCandidatesMap.set(raceId, candidateMap);
      });

      for (const [raceId, candidateMap] of raceCandidatesMap.entries()) {
        console.log(`debug`, raceCandidatesMap.get(raceId));
      }

    } catch (e) {
      console.error(e);
      error = 'Failed to load election details.';
    } finally {
      loading = false;
    }
  });

  function openRace(race: ElectionRace) {
    selectedRace = race;
  }

  function closeRace() {
    selectedRace = null;
  }
</script>

<svelte:head>
  <title>{election ? buildElectionName(election) : "Election Details"}</title>
</svelte:head>

<main class="max-w-5xl mx-auto p-6">
  {#if loading}
    <p class="text-gray-500 text-center">Loading election details...</p>
  {:else if error}
    <p class="text-red-600 text-center">{error}</p>
  {:else if election}
    <!-- Election Header -->
    <div class="mb-6 text-center">
      <h1 class="text-4xl font-bold text-gray-800">{buildElectionName(election)}</h1>
      <p class="text-gray-600 mt-2">
        {election.type.replace('_', ' ')} | {new Date(election.date).toLocaleDateString()}
      </p>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-6">
      <button
        class="px-4 py-2 -mb-px font-medium border-b-2 transition-colors duration-200"
        class:border-blue-600={activeTab === 'races'}
        class:text-blue-600={activeTab === 'races'}
        class:text-gray-500={activeTab !== 'races'}
        class:border-transparent={activeTab !== 'races'}
        on:click={() => { activeTab = 'races'; selectedRace = null; }}
      >
        Races
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

      <button
        class="px-4 py-2 -mb-px font-medium border-b-2 transition-colors duration-200"
        class:border-blue-600={activeTab === 'map'}
        class:text-blue-600={activeTab === 'map'}
        class:text-gray-500={activeTab !== 'map'}
        class:border-transparent={activeTab !== 'map'}
        on:click={() => activeTab = 'map'}
      >
        Map
      </button>
    </div>

    <!-- Tab Content -->
    {#if activeTab === 'races'}
      {#if selectedRace}
        <RaceDetail race={selectedRace} candidates={candidates.filter(c => c.race_id === selectedRace!._id)} onBack={closeRace} />
      {:else if races.length === 0}
        <p class="text-gray-600">No races available.</p>
      {:else}
        <div class="space-y-4">
          {#each races as r}
            <button
              type="button"
              on:click={() => openRace(r)}
              class="w-full text-left cursor-pointer bg-white border rounded-lg p-4 shadow hover:shadow-md transition-shadow"
            >
              <div class="font-semibold text-gray-800">
                Constituency: {r.constituency_name} ({r.constituency_id})
              </div>
              <div class="text-sm text-gray-500 mt-1">
                View Results for {r.results.length} Polling Stations
              </div>
            </button>
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
              <th class="text-left px-4 py-2">Race</th>
            </tr>
          </thead>
          <tbody>
            {#each candidates as c}
              <tr class="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-2">
                  <a href={`/persons/${c.person_id}`}>
                    {c.first_name} {c.middle_name ? c.middle_name + ' ' : ''}{c.last_name}
                    {c.alias ? `(${c.alias})` : ''}
                  </a>
                </td>
                <td class="px-4 py-2">
                  <a href={`/parties/${c.party}`}>{c.party || 'Independent'}</a>
                </td>
                <td class="px-4 py-2">{c.ballot_order}</td>
                <td class="px-4 py-2">
                  {raceMap.get(c.race_id)?.constituency_name}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    {:else if activeTab === 'map'}
      <MapComponent election={election} electionResults={results} candidatesMap={candidatesMap} />
    {/if}
  {/if}
</main>
