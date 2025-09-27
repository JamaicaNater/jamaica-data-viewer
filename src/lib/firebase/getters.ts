import { collection, doc, getDocs, getDoc, query, where, orderBy, type DocumentData, DocumentSnapshot } from "firebase/firestore";
import type {
  Constituency,
  ElectoralDivision,
  PollingDivision,
  Parish,
  Party,
  Election,
  ElectionCandidate,
  ElectionResult,
  CandidateResult
} from './types';
import { initFirebase } from "./client";

const db = initFirebase().db;

// ---------------------------
// Constituencies
// ---------------------------
export async function getAllConstituencies(): Promise<Constituency[]> {
  const snapshot = await getDocs(collection(db, "constituencies"));
  return snapshot.docs.map(doc => doc.data() as Constituency);
}

export async function getConstituencyByNo(const_no: string): Promise<Constituency | null> {
  const docRef = doc(db, "constituencies", const_no);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Constituency) : null;
}

// ---------------------------
// Electoral Divisions
// ---------------------------
export async function getEDsByConst(const_no: string): Promise<ElectoralDivision[]> {
  const q = query(collection(db, "electoral_divisions"), where("const_no", "==", const_no));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as ElectoralDivision);
}

// ---------------------------
// Polling Divisions
// ---------------------------
export async function getPDsByED(const_no: string, ed_no: string): Promise<PollingDivision[]> {
  const q = query(
    collection(db, "polling_divisions"),
    where("const_no", "==", const_no),
    where("ed_no", "==", ed_no)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as PollingDivision);
}

// ---------------------------
// Parties
// ---------------------------
export async function getAllParties(): Promise<Party[]> {
  const snapshot = await getDocs(collection(db, "parties"));
  return snapshot.docs.map(doc => doc.data() as Party);
}
  
function parseElection(doc: DocumentSnapshot): Election {
  const data = doc.data(); // data contains the actual fields
  if (!data) throw new Error("Document has no data");

  return {
    _id: doc.id,                        // Now this works
    name: data.name,
    type: data.type,
    date: data.date.toDate(),
    recount_date: data.recount_date?.toDate(),
    constituency_name: data.constituency_name,
    constituency_id: data.constituency_id,
    created_at: data.created_at?.toDate(),
    updated_at: data.updated_at?.toDate(),
  };
}

// ---------------------------
// Elections
// ---------------------------
export async function getElections(): Promise<Election[]> {
  const q = query(
    collection(db, "elections"),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);

  const elections = snapshot.docs.map(doc => parseElection(doc));
  console.log("Fetched elections:", elections);
  return elections;
}

export async function getElectionById(election_id: string): Promise<Election | null> {
  const docRef = doc(db, "elections", election_id);
  const docSnap = await getDoc(docRef);

  return docSnap.exists() ? parseElection(docSnap) : null;
}

// ---------------------------
// Candidates & Results
// ---------------------------
export async function getElectionCandidates(election_id: string): Promise<ElectionCandidate[]> {
  const q = query(collection(db, "election_candidates"), where("election_id", "==", election_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as ElectionCandidate);
}

export async function getElectionResults(election_id: string): Promise<ElectionResult[]> {
  const q = query(collection(db, "election_results"), where("election_id", "==", election_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as ElectionResult);
}

export async function getCandidateResultsByElectionResult(election_result_id: string): Promise<CandidateResult[]> {
  const q = query(
    collection(db, "candidate_results"),
    where("election_result_id", "==", election_result_id)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as CandidateResult);
}
