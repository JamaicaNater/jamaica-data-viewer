import type { Election, ElectionCandidate } from "$lib/firebase/types";

export function capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

export function capitalizeName(name: string): string {
    return name.split(' ').map(part => capitalizeWords(part)).join(' ');
}

export function formatCandidateName(candidate: ElectionCandidate): string {
    return `${capitalizeName(candidate.first_name)} ${capitalizeName(candidate.last_name)} (${capitalizeWords(candidate.party)})`;
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function buildElectionName(election: Election): string {
    return `${formatDate(election.date)} - ${capitalizeWords(election.type.replace('_', ' '))}`;
}