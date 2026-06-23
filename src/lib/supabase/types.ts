export type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELED";

export type MatchStage =
  | "GROUP_STAGE"
  | "LAST_32"
  | "LAST_16"
  | "QUARTER_FINALS"
  | "SEMI_FINALS"
  | "THIRD_PLACE"
  | "FINAL";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  province: string | null;
  insurances: string[];
  referral_code: string;
  referred_by: string | null;
  marketing_consent: boolean;
  consent_at: string | null;
  is_nda_client: boolean;
  nda_license_plate: string | null;
  nda_client_verified: boolean;
  nda_client_verified_at: string | null;
  created_at: string;
};

export type Team = {
  id: number;
  name: string;
  short_name: string | null;
  tla: string | null;
  crest_url: string | null;
  group_letter: string | null;
};

export type Match = {
  id: number;
  utc_kickoff: string;
  status: MatchStatus;
  stage: MatchStage;
  group_letter: string | null;
  home_team_id: number | null;
  away_team_id: number | null;
  home_team_name: string | null;
  away_team_name: string | null;
  home_score: number | null;
  away_score: number | null;
  scored_at: string | null;
  updated_at: string;
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  points_awarded: number | null;
  created_at: string;
  updated_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  full_name: string;
  referral_code: string;
  registered_at: string;
  total_points: number;
  prediction_points: number;
  exact_hits: number;
  aciertos_exactos: number;
  aciertos_diferencia: number;
  aciertos_ganador: number;
  errados: number;
  jugados: number;
  total_predicciones: number;
  argentina_hits: number;
  referral_points: number;
  referral_count: number;
  nda_bonus_points: number;
};

export const ARGENTINE_PROVINCES = [
  "CABA",
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán"
] as const;

export const INSURANCE_TYPES = [
  { id: "auto", label: "Auto" },
  { id: "hogar", label: "Hogar" },
  { id: "vida", label: "Vida" },
  { id: "art", label: "ART" },
  { id: "comercio", label: "Comercio / PyME" },
  { id: "salud", label: "Salud" },
  { id: "ninguno", label: "Ninguno todavía" }
] as const;
