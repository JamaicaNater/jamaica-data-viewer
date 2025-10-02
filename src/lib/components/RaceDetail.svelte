<script lang="ts">
  import type { ElectionCandidate, ElectionRace } from '$lib/firebase/types';
	import { formatCandidateName } from '$lib/helpers/format';
  export let race: ElectionRace;
  export let candidates: ElectionCandidate[];

  const candidatesByBallot = new Map<number, ElectionCandidate>();
  candidates.forEach(c => {
    if (c.ballot_order !== null && c.ballot_order !== undefined) {
      candidatesByBallot.set(c.ballot_order, c);
    }
  });

  export let onBack: () => void;

  function goBack() {
    onBack?.();
  }
</script>

<div class="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-4xl mx-auto">
  <!-- Back Button -->
  <button
    type="button"
    class="mb-4 inline-flex items-center px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm sm:text-base"
    on:click={goBack}
  >
    ← Back
  </button>

  <!-- Header -->
  <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
    {race.constituency_name} ({race.constituency_no}) 
  </h2>
  <p class="text-gray-600 text-sm sm:text-base mb-4">
    Results for {race.results.length} polling stations
  </p>

  {#if race.results.length > 0}
    <!-- Scrollable list -->
    <div class="space-y-4 max-h-[50vh] overflow-y-auto">
      {#each race.results as res}
        <div class="bg-gray-50 border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <!-- Polling division header -->
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
            <div class="font-semibold text-gray-800 text-sm sm:text-base">
              Polling Division {res.polling_division} | {res.polling_station}
            </div>
            <div class="text-gray-600 text-sm sm:text-base">
              Total Votes: {res.total_votes} | Rejected: {res.ballots_rejected}
            </div>
          </div>

          <!-- Candidate results -->
          {#if res.candidate_results?.length}
            <ul class="mt-2 space-y-1 pl-2 border-l border-gray-300">
              {#each res.candidate_results as candidate_result}
                {#if candidatesByBallot.has(candidate_result.ballot_order)}
                  <li class="text-gray-700 text-sm sm:text-base flex justify-between">
                    <span>{formatCandidateName(candidatesByBallot.get(candidate_result.ballot_order)!)} </span>
                    <span class="font-semibold">{candidate_result.votes} votes</span>
                  </li>
                {/if}
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="mt-4 text-gray-500 text-center">No results yet.</p>
  {/if}
</div>
