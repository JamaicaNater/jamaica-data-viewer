import type { Election } from "$lib/firebase/types";

export function capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function buildElectionName(election: Election): string {
    return `${formatDate(election.date)} - ${capitalizeWords(election.type.replace('_', ' '))}`;
}