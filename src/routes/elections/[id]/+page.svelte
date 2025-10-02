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
        <RaceDetail 
          race={selectedRace} 
          candidates={candidates.filter(c => c.race_id === selectedRace!._id)} 
          onBack={closeRace} 
        />
      {:else if races.length === 0}
        <p class="text-gray-600">No races available.</p>
      {:else}
        <div class="max-h-[50vh] overflow-y-auto space-y-4">
          {#each races as r}
            <button
              type="button"
              on:click={() => openRace(r)}
              class="w-full text-left cursor-pointer bg-white border rounded-lg p-4 shadow hover:shadow-md transition-shadow"
            >
              <div class="font-semibold text-gray-800">
                Constituency: {r.constituency_name} ({r.constituency_no})
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
        <div class="max-h-[50vh] overflow-y-auto grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
          {#each candidates as c}
            <div class="bg-white border rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div class="text-lg font-semibold text-gray-800">
                  <a href={`/persons/${c.person_id}`}>
                    {c.first_name} {c.middle_name ? c.middle_name + ' ' : ''}{c.last_name}
                    {c.alias ? ` (${c.alias})` : ''}
                  </a>
                </div>
                <div class="text-sm text-gray-500 mt-1 sm:mt-0">
                  Ballot Order: {c.ballot_order}
                </div>
              </div>

              <div class="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-600 text-sm">
                <div>Party: <a href={`/parties/${c.party}`}>{c.party || 'Independent'}</a></div>
                <div>Race: {raceMap.get(c.race_id)?.constituency_name}</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else if activeTab === 'map' && races.length > 0}
      <MapComponent races={races} />
    {:else if activeTab === 'map'}
      <p class="text-gray-500 text-center">Loading map...</p>
    {/if}
  {/if}
</main>
