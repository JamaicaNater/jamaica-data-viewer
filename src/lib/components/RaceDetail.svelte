<!-- src/lib/components/RaceDetail.svelte -->
<script lang="ts">
  import type { ElectionRace } from "$lib/firebase/types";

  export let race: ElectionRace;
</script>

{#if race}
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-gray-100 border rounded-lg p-4">
      <h1 class="text-2xl font-bold text-gray-800">
        Constituency: {race.constituency_name}
      </h1>
      <p class="text-sm text-gray-500">
        Election ID: {race.election_id} • Created: {race.created_at}
      </p>
    </div>

    <!-- Results list -->
    {#if race.results?.length}
      {#each race.results as r, i}
        <div
          class="bg-white border rounded-lg p-4 shadow hover:shadow-md transition-shadow"
        >
          <div class="font-semibold text-gray-800">
            Division {r.polling_division} | Station {r.polling_station}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            Location: {r.polling_station_location}
          </div>
          <div class="text-sm text-gray-600 mt-2">
            Electors: {r.electors_on_list} • Votes: {r.total_votes} •
            Rejected: {r.ballots_rejected}
          </div>

          <!-- Candidate votes -->
          {#if r.candidate_results?.length}
            <ul class="mt-3 space-y-1">
              {#each r.candidate_results.filter(c => c?.ballot_order) as c}
                <li class="flex justify-between text-gray-700 text-sm">
                  <span>Candidate #{c.ballot_order}</span>
                  <span class="font-semibold">{c.votes ?? 0} votes</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    {:else}
      <p class="text-gray-500 italic">No polling station results yet.</p>
    {/if}
  </div>
{:else}
  <p class="text-gray-500">No race selected.</p>
{/if}
