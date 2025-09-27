import { collection, doc, getDocs, getDoc, query, where, orderBy, type DocumentData } from "firebase/firestore";
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

function parseElection(doc: DocumentData): Election {
  return {
    election_id: doc.id,
    name: doc.name,
    type: doc.type,
    date: doc.date.toDate(),          // convert Firestore timestamp to JS Date
    recount_date: doc.recount_date?.toDate(),
    constituency_name: doc.constituency_name,
    constituency_id: doc.constituency_id,
    created_at: doc.created_at?.toDate(),
    updated_at: doc.updated_at?.toDate(),
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

  const elections = snapshot.docs.map(doc => parseElection(doc.data()));
  return elections;
}

// ---------------------------
// Candidates & Results
// ---------------------------
export async function getCandidatesByElection(election_id: string): Promise<ElectionCandidate[]> {
  const q = query(collection(db, "election_candidates"), where("election_id", "==", election_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as ElectionCandidate);
}

export async function getResultsByElection(election_id: string): Promise<ElectionResult[]> {
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
