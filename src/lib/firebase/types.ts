// Geometry point
export interface Point {
  lat: number;
  lon: number;
}

// ---------------------------
// Models
// ---------------------------
export interface Parish {
  object_id: number;
  parish_name: string;
  shape_area: number;
  shape_length: number;
  lat: number;
  lon: number;
  geometry: Point[];
}

export interface Constituency {
  object_id: number;
  const_no: string;
  const_name: string;
  region_no: string;
  parish_name: string;
  sitting_mp: string;
  mp_affil: string;
  shape_area: number;
  shape_length: number;
  lat: number;
  lon: number;
  geometry: Point[];
}

export interface Location {
  object_id: number;
  entity_name: string;
  entityLocationType: string; // 'constituency' | 'electoral_division' | 'polling_division' | 'polling_station'
  const_no?: string;
  ed_no?: string;
  pd_no?: string;
  lat: number;
  lon: number;
  geometry: Point[];
}

export interface ElectoralDivision {
  object_id: number;
  const_no: string;
  ed_no: string;
  ed_name: string;
  const_name: string;
  region_no: string;
  parish_name: string;
  sitting_councillor: string;
  mp_affil: string;
  shape_area: number;
  shape_length: number;
  lat: number;
  lon: number;
  geometry: Point[];
}

export interface PollingDivision {
  object_id: number;
  const_no: string;
  ed_no: string;
  ed_name: string;
  const_name: string;
  region_no: string;
  parish_name: string;
  pd_no: string;
  pd_status: string;
  adj_pd: string;
  anomaly: string;
  anomaly_type: string;
  category: string;
  category_2: string;
  agree_sign: string;
  inter_pd_n: string;
  old_pd_no: string;
  elector_cn: number;
  shape_area: number;
  shape_length: number;
  lat: number;
  lon: number;
  geometry: Point[];
}

export interface Party {
  name: string;
  abbreviation?: string;
  color?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Election {
  _id?: string;
  type: "general" | "local_government" | "by_election" | "referendum";
  date: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ElectionRace {
  _id?: string;
  election_id?: string;
  constituency_name?: string;
  constituency_id?: number;
  results: ElectionResult[];
  created_at?: Date;
  updated_at?: Date;
}


export interface ElectionCandidate {
  _id?: string;
  election_id: string;
  person_id: string;
  race_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  alias?: string;
  ballot_order: number;
  party?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ElectionResult {
  polling_division: string;
  polling_station: string;
  polling_station_location?: string;
  candidate_results: {ballot_order: number; votes: number}[]; // Can be ElectionCandidateResult[]
  ballots_rejected: number;
  total_votes: number;
  electors_on_list: number;
  created_at?: Date;
  updated_at?: Date;
}