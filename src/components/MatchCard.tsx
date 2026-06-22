"use client";

import { useState, useEffect } from "react";
import { isPredictionLocked, scorePrediction } from "@/lib/scoring";
import type { Match, Prediction } from "@/lib/supabase/types";

/** Mapa: nombre en inglés (football-data.org) → { es: nombre en español, flag: emoji } */
const TEAM_MAP: Record<string, { es: string; flag: string }> = {
  // CONMEBOL
  "Argentina":              { es: "Argentina",          flag: "🇦🇷" },
  "Brazil":                 { es: "Brasil",             flag: "🇧🇷" },
  "Uruguay":                { es: "Uruguay",            flag: "🇺🇾" },
  "Colombia":               { es: "Colombia",           flag: "🇨🇴" },
  "Ecuador":                { es: "Ecuador",            flag: "🇪🇨" },
  "Venezuela":              { es: "Venezuela",          flag: "🇻🇪" },
  "Paraguay":               { es: "Paraguay",           flag: "🇵🇾" },
  "Peru":                   { es: "Perú",               flag: "🇵🇪" },
  "Chile":                  { es: "Chile",              flag: "🇨🇱" },
  "Bolivia":                { es: "Bolivia",            flag: "🇧🇴" },

  // CONCACAF
  "United States":          { es: "Estados Unidos",     flag: "🇺🇸" },
  "USA":                    { es: "Estados Unidos",     flag: "🇺🇸" },
  "Mexico":                 { es: "México",             flag: "🇲🇽" },
  "Canada":                 { es: "Canadá",             flag: "🇨🇦" },
  "Panama":                 { es: "Panamá",             flag: "🇵🇦" },
  "Honduras":               { es: "Honduras",           flag: "🇭🇳" },
  "Costa Rica":             { es: "Costa Rica",         flag: "🇨🇷" },
  "Jamaica":                { es: "Jamaica",            flag: "🇯🇲" },
  "Trinidad and Tobago":    { es: "Trinidad y Tobago",  flag: "🇹🇹" },
  "Cuba":                   { es: "Cuba",               flag: "🇨🇺" },
  "Guatemala":              { es: "Guatemala",          flag: "🇬🇹" },
  "El Salvador":            { es: "El Salvador",        flag: "🇸🇻" },
  "Haiti":                  { es: "Haití",              flag: "🇭🇹" },

  // UEFA
  "Germany":                { es: "Alemania",           flag: "🇩🇪" },
  "France":                 { es: "Francia",            flag: "🇫🇷" },
  "Spain":                  { es: "España",             flag: "🇪🇸" },
  "Portugal":               { es: "Portugal",           flag: "🇵🇹" },
  "England":                { es: "Inglaterra",         flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Netherlands":            { es: "Países Bajos",       flag: "🇳🇱" },
  "Belgium":                { es: "Bélgica",            flag: "🇧🇪" },
  "Italy":                  { es: "Italia",             flag: "🇮🇹" },
  "Denmark":                { es: "Dinamarca",          flag: "🇩🇰" },
  "Switzerland":            { es: "Suiza",              flag: "🇨🇭" },
  "Austria":                { es: "Austria",            flag: "🇦🇹" },
  "Serbia":                 { es: "Serbia",             flag: "🇷🇸" },
  "Croatia":                { es: "Croacia",            flag: "🇭🇷" },
  "Poland":                 { es: "Polonia",            flag: "🇵🇱" },
  "Turkey":                 { es: "Turquía",            flag: "🇹🇷" },
  "Türkiye":                { es: "Turquía",            flag: "🇹🇷" },
  "Czech Republic":         { es: "República Checa",    flag: "🇨🇿" },
  "Czechia":                { es: "República Checa",    flag: "🇨🇿" },
  "Slovakia":               { es: "Eslovaquia",         flag: "🇸🇰" },
  "Hungary":                { es: "Hungría",            flag: "🇭🇺" },
  "Romania":                { es: "Rumania",            flag: "🇷🇴" },
  "Ukraine":                { es: "Ucrania",            flag: "🇺🇦" },
  "Greece":                 { es: "Grecia",             flag: "🇬🇷" },
  "Scotland":               { es: "Escocia",            flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "Wales":                  { es: "Gales",              flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  "Norway":                 { es: "Noruega",            flag: "🇳🇴" },
  "Sweden":                 { es: "Suecia",             flag: "🇸🇪" },
  "Albania":                { es: "Albania",            flag: "🇦🇱" },
  "Bosnia and Herzegovina": { es: "Bosnia y Herzegovina", flag: "🇧🇦" },
  "Bosnia-Herzegovina":     { es: "Bosnia y Herzegovina", flag: "🇧🇦" },
  "Curaçao":                { es: "Curazao",             flag: "🇨🇼" },
  "Curacao":                { es: "Curazao",             flag: "🇨🇼" },
  "Slovenia":               { es: "Eslovenia",          flag: "🇸🇮" },
  "Finland":                { es: "Finlandia",          flag: "🇫🇮" },
  "Iceland":                { es: "Islandia",           flag: "🇮🇸" },
  "Northern Ireland":       { es: "Irlanda del Norte",  flag: "🏴󠁧󠁢󠁮󠁩󠁲󠁿" },
  "Republic of Ireland":    { es: "Irlanda",            flag: "🇮🇪" },
  "Ireland":                { es: "Irlanda",            flag: "🇮🇪" },
  "Israel":                 { es: "Israel",             flag: "🇮🇱" },
  "Georgia":                { es: "Georgia",            flag: "🇬🇪" },
  "Montenegro":             { es: "Montenegro",         flag: "🇲🇪" },
  "North Macedonia":        { es: "Macedonia del Norte",flag: "🇲🇰" },
  "Bulgaria":               { es: "Bulgaria",           flag: "🇧🇬" },
  "Kosovo":                 { es: "Kosovo",             flag: "🇽🇰" },
  "Luxembourg":             { es: "Luxemburgo",         flag: "🇱🇺" },
  "Belarus":                { es: "Bielorrusia",        flag: "🇧🇾" },

  // CAF (África)
  "Morocco":                { es: "Marruecos",          flag: "🇲🇦" },
  "Senegal":                { es: "Senegal",            flag: "🇸🇳" },
  "Egypt":                  { es: "Egipto",             flag: "🇪🇬" },
  "Nigeria":                { es: "Nigeria",            flag: "🇳🇬" },
  "Cameroon":               { es: "Camerún",            flag: "🇨🇲" },
  "South Africa":           { es: "Sudáfrica",          flag: "🇿🇦" },
  "DR Congo":               { es: "R.D. Congo",         flag: "🇨🇩" },
  "Congo DR":               { es: "R.D. Congo",         flag: "🇨🇩" },
  "Congo":                  { es: "Congo",              flag: "🇨🇬" },
  "Mali":                   { es: "Malí",               flag: "🇲🇱" },
  "Ivory Coast":            { es: "Costa de Marfil",    flag: "🇨🇮" },
  "Côte d'Ivoire":          { es: "Costa de Marfil",    flag: "🇨🇮" },
  "Cote d'Ivoire":          { es: "Costa de Marfil",    flag: "🇨🇮" },
  "Tunisia":                { es: "Túnez",              flag: "🇹🇳" },
  "Algeria":                { es: "Argelia",            flag: "🇩🇿" },
  "Ghana":                  { es: "Ghana",              flag: "🇬🇭" },
  "Tanzania":               { es: "Tanzania",           flag: "🇹🇿" },
  "Zambia":                 { es: "Zambia",             flag: "🇿🇲" },
  "Uganda":                 { es: "Uganda",             flag: "🇺🇬" },
  "Angola":                 { es: "Angola",             flag: "🇦🇴" },
  "Cape Verde":             { es: "Cabo Verde",         flag: "🇨🇻" },
  "Cape Verde Islands":     { es: "Cabo Verde",         flag: "🇨🇻" },
  "Guinea":                 { es: "Guinea",             flag: "🇬🇳" },
  "Benin":                  { es: "Benín",              flag: "🇧🇯" },
  "Gabon":                  { es: "Gabón",              flag: "🇬🇦" },
  "Comoros":                { es: "Comoras",            flag: "🇰🇲" },
  "Ethiopia":               { es: "Etiopía",            flag: "🇪🇹" },
  "Sudan":                  { es: "Sudán",              flag: "🇸🇩" },
  "Libya":                  { es: "Libia",              flag: "🇱🇾" },
  "Kenya":                  { es: "Kenia",              flag: "🇰🇪" },
  "Namibia":                { es: "Namibia",            flag: "🇳🇦" },
  "Zimbabwe":               { es: "Zimbabue",           flag: "🇿🇼" },
  "Burkina Faso":           { es: "Burkina Faso",       flag: "🇧🇫" },
  "Niger":                  { es: "Níger",              flag: "🇳🇪" },
  "Mozambique":             { es: "Mozambique",         flag: "🇲🇿" },
  "Mauritania":             { es: "Mauritania",         flag: "🇲🇷" },
  "Rwanda":                 { es: "Ruanda",             flag: "🇷🇼" },

  // AFC (Asia)
  "Japan":                  { es: "Japón",              flag: "🇯🇵" },
  "Korea Republic":         { es: "Corea del Sur",      flag: "🇰🇷" },
  "South Korea":            { es: "Corea del Sur",      flag: "🇰🇷" },
  "IR Iran":                { es: "Irán",               flag: "🇮🇷" },
  "Iran":                   { es: "Irán",               flag: "🇮🇷" },
  "Australia":              { es: "Australia",          flag: "🇦🇺" },
  "Saudi Arabia":           { es: "Arabia Saudita",     flag: "🇸🇦" },
  "Qatar":                  { es: "Catar",              flag: "🇶🇦" },
  "Uzbekistan":             { es: "Uzbekistán",         flag: "🇺🇿" },
  "Jordan":                 { es: "Jordania",           flag: "🇯🇴" },
  "Iraq":                   { es: "Irak",               flag: "🇮🇶" },
  "China PR":               { es: "China",              flag: "🇨🇳" },
  "China":                  { es: "China",              flag: "🇨🇳" },
  "Indonesia":              { es: "Indonesia",          flag: "🇮🇩" },
  "United Arab Emirates":   { es: "Emiratos Árabes",    flag: "🇦🇪" },
  "Oman":                   { es: "Omán",               flag: "🇴🇲" },
  "Bahrain":                { es: "Baréin",             flag: "🇧🇭" },
  "Kuwait":                 { es: "Kuwait",             flag: "🇰🇼" },
  "Palestine":              { es: "Palestina",          flag: "🇵🇸" },
  "Kyrgyzstan":             { es: "Kirguistán",         flag: "🇰🇬" },
  "Thailand":               { es: "Tailandia",          flag: "🇹🇭" },
  "Vietnam":                { es: "Vietnam",            flag: "🇻🇳" },
  "Tajikistan":             { es: "Tayikistán",         flag: "🇹🇯" },
  "India":                  { es: "India",              flag: "🇮🇳" },
  "North Korea":            { es: "Corea del Norte",    flag: "🇰🇵" },
  "DPR Korea":              { es: "Corea del Norte",    flag: "🇰🇵" },

  // OFC (Oceanía)
  "New Zealand":            { es: "Nueva Zelanda",      flag: "🇳🇿" },
  "Fiji":                   { es: "Fiyi",               flag: "🇫🇯" },
  "Papua New Guinea":       { es: "Papúa Nueva Guinea", flag: "🇵🇬" },

  // Otros
  "Russia":                 { es: "Rusia",              flag: "🇷🇺" },
};

type Props = {
  match: Match;
  prediction: Prediction | null;
  onSave: (homeScore: number, awayScore: number) => Promise<void>;
  /** Diferencia reloj-dispositivo vs servidor (ms). Neutraliza el cambio de
   *  hora del celular: serverNow ≈ Date.now() - clockOffsetMs. */
  clockOffsetMs?: number;
};

export function MatchCard({ match, prediction, onSave, clockOffsetMs = 0 }: Props) {
  // null = sin cargar todavía (placeholder visible)
  // number = valor ingresado (incluido 0)
  const [home, setHome] = useState<number | null>(prediction?.home_score ?? null);
  const [away, setAway] = useState<number | null>(prediction?.away_score ?? null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Hora del servidor estimada — NO el reloj crudo del dispositivo (anti-trampa)
  const serverNow = new Date(Date.now() - clockOffsetMs);
  const locked = isPredictionLocked(match.utc_kickoff, serverNow);
  const finished = match.status === "FINISHED";
  const live = match.status === "LIVE";
  const points = finished && prediction
    ? scorePrediction(
        prediction.home_score,
        prediction.away_score,
        match.home_score ?? 0,
        match.away_score ?? 0,
        match.stage
      )
    : null;

  // Si llega un nuevo prediction desde el padre (post-save), sincronizar
  useEffect(() => {
    if (prediction) {
      setHome(prediction.home_score);
      setAway(prediction.away_score);
    }
  }, [prediction]);

  useEffect(() => {
    if (savedAt === null) return;
    const t = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(t);
  }, [savedAt]);

  async function handleSave() {
    if (locked || saving) return;
    // Si dejaron alguno vacío, considerar 0
    const h = home ?? 0;
    const a = away ?? 0;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(h, a);
      setSavedAt(Date.now());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  const kickoff = new Date(match.utc_kickoff);
  const dateStr = kickoff.toLocaleString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires"
  });

  const hasPrediction = !!prediction;
  // Card resaltado cyan suave si ya cargó pronóstico y todavía no se jugó
  const predictedStyle =
    hasPrediction && !finished && !live
      ? "!bg-nda-accent/10 !border-nda-accent/40"
      : "";

  return (
    <div
      className={`card relative ${
        live ? "border-l-4 border-l-nda-accent glow-cyan" : ""
      } ${predictedStyle}`}
    >
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-nda-dark/60">
          {stageLabel(match.stage)}
          {match.group_letter ? ` · Grupo ${match.group_letter}` : ""}
        </span>
        {live ? (
          <span className="chip bg-nda-accent/20 text-nda-primary">
            <span className="inline-block w-2 h-2 rounded-full bg-nda-accent animate-pulse" />{" "}
            En vivo
          </span>
        ) : hasPrediction && !finished ? (
          <span className="flex items-center gap-1.5 text-nda-primary font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-nda-primary" />
            Pronosticado
            <span className="text-nda-dark/40 font-normal ml-1">·</span>
            <span className="text-nda-dark/50 font-normal">{dateStr}</span>
          </span>
        ) : (
          <span className="text-nda-dark/60">{dateStr}</span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <TeamSlot name={match.home_team_name ?? "—"} align="left" />

        <div className="flex items-center gap-2">
          <ScoreInput
            value={home}
            onChange={setHome}
            disabled={locked}
          />
          <span className="text-nda-dark/40 text-xs font-medium">vs</span>
          <ScoreInput
            value={away}
            onChange={setAway}
            disabled={locked}
          />
        </div>

        <TeamSlot name={match.away_team_name ?? "—"} align="right" />
      </div>

      {finished && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-nda-dark/70">
              Resultado real: <strong>{match.home_score} – {match.away_score}</strong>
            </span>
            <span className={`font-semibold ${points && points > 0 ? "text-nda-primary" : "text-nda-dark/50"}`}>
              {points !== null ? `${points} pts` : "—"}
            </span>
          </div>
          {prediction && points !== null && (() => {
            const label = getResultLabel(
              prediction.home_score,
              prediction.away_score,
              match.home_score ?? 0,
              match.away_score ?? 0
            );
            return (
              <div
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-center ${label.style}`}
              >
                {label.emoji} {label.text}
              </div>
            );
          })()}
        </div>
      )}

      {!finished && (
        <>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-nda-dark/60">
              {locked ? "Pronóstico cerrado" : "Cierra 5 min antes del kickoff"}
            </span>
            {!locked && (
              <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 !px-4 text-sm">
                {saving ? "Guardando..." : savedAt ? "Guardado ✓" : prediction ? "Actualizar" : "Guardar"}
              </button>
            )}
          </div>
          {saveError && (
            <p className="mt-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {saveError}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function TeamSlot({ name, align = "left" }: { name: string; align?: "left" | "right" }) {
  const team = TEAM_MAP[name] ?? { es: name, flag: "🏳️" };
  const isRight = align === "right";
  return (
    <div className={`flex items-center gap-1.5 ${isRight ? "flex-row-reverse justify-start" : "justify-start"}`}>
      <span className="text-xl leading-none shrink-0">{team.flag}</span>
      <span className={`font-semibold text-nda-dark text-sm sm:text-base ${isRight ? "text-right" : "text-left"}`}>
        {team.es}
      </span>
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  disabled
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  disabled: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      disabled={disabled}
      value={value ?? ""}
      placeholder="–"
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") {
          onChange(null);
          return;
        }
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 0 && n <= 20) onChange(n);
      }}
      className="w-14 h-12 rounded-xl border border-nda-primary/20 text-center text-lg font-bold text-nda-dark bg-white focus:border-nda-primary focus:outline-none focus:ring-2 focus:ring-nda-primary/20 disabled:bg-nda-soft disabled:text-nda-dark/60 placeholder:text-nda-dark/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

/** Devuelve el label visual según el tipo de acierto */
function getResultLabel(
  predH: number,
  predA: number,
  realH: number,
  realA: number
): { emoji: string; text: string; style: string } {
  // Resultado exacto
  if (predH === realH && predA === realA) {
    return {
      emoji: "🎯",
      text: "¡Resultado exacto!",
      style: "bg-nda-success/20 text-nda-dark border border-nda-success/40",
    };
  }

  const predWinner = Math.sign(predH - predA);
  const realWinner = Math.sign(realH - realA);

  if (predWinner === realWinner) {
    // Acertó diferencia de goles
    if (predH - predA === realH - realA) {
      return {
        emoji: "👌",
        text: "Acertaste la diferencia",
        style: "bg-nda-accent/20 text-nda-primary border border-nda-accent/40",
      };
    }
    // Solo acertó ganador
    return {
      emoji: "✓",
      text: "Acertaste el ganador",
      style: "bg-nda-primary/10 text-nda-primary border border-nda-primary/20",
    };
  }

  // No acertó nada
  return {
    emoji: "✗",
    text: "Erraste este partido",
    style: "bg-nda-dark/5 text-nda-dark/50 border border-nda-dark/10",
  };
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE: "Fase de grupos",
    LAST_32: "Dieciseisavos",
    LAST_16: "Octavos",
    QUARTER_FINALS: "Cuartos",
    SEMI_FINALS: "Semifinales",
    THIRD_PLACE: "Tercer puesto",
    FINAL: "Final"
  };
  return map[stage] ?? stage;
}
