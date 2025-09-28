import type { Election } from "$lib/firebase/types";

export function buildElectionName(election: Election): string {
    return `${election.date.getFullYear()} - ${election.constituency_name} - ${election.type.replace('_', ' ')}`;
}