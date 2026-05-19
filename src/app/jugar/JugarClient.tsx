"use client";

import { useEffect, useMemo, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { ReferralBox } from "@/components/ReferralBox";
import { createClient } from "@/lib/supabase/client";
import type { Match, Prediction, MatchStage } from "@/lib/supabase/types";

type Props = {
  matches: Match[];
  predictions: Prediction[];
  referralCode: string;
};

type MainTab = "grupos" | "eliminatorias";

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP_STAGE: "Fase de grupos",
  LAST_16: "Octavos de final",
  QUARTER_FINALS: "Cuartos de final",
  SEMI_FINALS: "Semifinales",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

const KNOCKOUT_ORDER: MatchStage[] = [
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
];

/**
 * Devuelve la etapa activa del torneo en este momento:
 * 1. Partido en vivo → su etapa
 * 2. Próximo partido por jugarse → su etapa
 * 3. Último partido jugado → su etapa
 * 4. Default: GROUP_STAGE
 */
function getActiveStage(matches: Match[]): MatchStage {
  const live = matches.find(
    (m) => m.status === "LIVE" || m.status === "IN_PLAY"
  );
  if (live) return live.stage;

  const upcoming = [...matches]
    .filter((m) => m.status !== "FINISHED" && m.status !== "AWARDED")
    .sort(
      (a, b) =>
        new Date(a.utc_kickoff).getTime() - new Date(b.utc_kickoff).getTime()
    );
  if (upcoming.length > 0) return upcoming[0].stage;

  const finished = [...matches]
    .filter((m) => m.status === "FINISHED" || m.status === "AWARDED")
    .sort(
      (a, b) =>
        new Date(b.utc_kickoff).getTime() - new Date(a.utc_kickoff).getTime()
    );
  if (finished.length > 0) return finished[0].stage;

  return "GROUP_STAGE";
}

/**
 * Devuelve el grupo más relevante para mostrar:
 * el grupo del próximo partido de grupos sin jugar,
 * o el primer grupo disponible.
 */
function getDefaultGroup(matches: Match[]): string | null {
  const upcoming = [...matches]
    .filter(
      (m) =>
        m.stage === "GROUP_STAGE" &&
        m.status !== "FINISHED" &&
        m.status !== "AWARDED" &&
        m.group_letter
    )
    .sort(
      (a, b) =>
        new Date(a.utc_kickoff).getTime() - new Date(b.utc_kickoff).getTime()
    );
  if (upcoming.length > 0) return upcoming[0].group_letter!;

  const letters = matches
    .filter((m) => m.stage === "GROUP_STAGE" && m.group_letter)
    .map((m) => m.group_letter as string);
  return [...new Set(letters)].sort()[0] ?? null;
}

export function JugarClient({ matches, predictions, referralCode }: Props) {
  const supabase = createClient();
  const [localPreds, setLocalPreds] = useState<Record<number, Prediction>>(() =>
    Object.fromEntries(predictions.map((p) => [p.match_id, p]))
  );
  const [mainTab, setMainTab] = useState<MainTab>(() => {
    const stage = getActiveStage(matches);
    return stage === "GROUP_STAGE" ? "grupos" : "eliminatorias";
  });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(() =>
    getDefaultGroup(matches)
  );
  const [selectedStage, setSelectedStage] = useState<MatchStage | null>(() => {
    const stage = getActiveStage(matches);
    return stage !== "GROUP_STAGE" ? stage : null;
  });

  // Obtener grupos disponibles en orden
  const groups = useMemo(() => {
    const letters = matches
      .filter((m) => m.stage === "GROUP_STAGE" && m.group_letter)
      .map((m) => m.group_letter as string);
    return [...new Set(letters)].sort();
  }, [matches]);

  // Obtener fases de eliminatoria disponibles
  const knockoutStages = useMemo(() => {
    const stages = matches
      .filter((m) => m.stage !== "GROUP_STAGE")
      .map((m) => m.stage);
    const unique = [...new Set(stages)];
    return KNOCKOUT_ORDER.filter((s) => unique.includes(s));
  }, [matches]);

  // Fallback: si el usuario cambia de tab y el estado es null, auto-seleccionar
  useEffect(() => {
    if (mainTab === "grupos" && !selectedGroup && groups.length > 0) {
      setSelectedGroup(groups[0]);
    }
    if (mainTab === "eliminatorias" && !selectedStage && knockoutStages.length > 0) {
      // Preferir la etapa activa del torneo si ya está en la lista
      const active = getActiveStage(matches);
      const best = knockoutStages.includes(active) ? active : knockoutStages[0];
      setSelectedStage(best);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab]);

  // Partidos filtrados según la selección
  const filteredMatches = useMemo(() => {
    if (mainTab === "grupos") {
      return matches.filter(
        (m) => m.stage === "GROUP_STAGE" && m.group_letter === selectedGroup
      );
    }
    return matches.filter((m) => m.stage === selectedStage);
  }, [matches, mainTab, selectedGroup, selectedStage]);

  // Progreso de predicciones por grupo
  function groupProgress(letter: string) {
    const groupMatches = matches.filter(
      (m) => m.stage === "GROUP_STAGE" && m.group_letter === letter
    );
    const done = groupMatches.filter((m) => localPreds[m.id]).length;
    return { done, total: groupMatches.length };
  }

  async function savePrediction(matchId: number, home: number, away: number) {
    const { data: userResp } = await supabase.auth.getUser();
    const userId = userResp.user?.id;
    if (!userId) return;

    const existing = localPreds[matchId];
    if (existing) {
      const { data, error } = await supabase
        .from("predictions")
        .update({ home_score: home, away_score: away, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      if (!error && data) setLocalPreds({ ...localPreds, [matchId]: data });
    } else {
      const { data, error } = await supabase
        .from("predictions")
        .insert({ user_id: userId, match_id: matchId, home_score: home, away_score: away })
        .select()
        .single();
      if (!error && data) setLocalPreds({ ...localPreds, [matchId]: data });
    }
  }

  return (
    <div className="space-y-6">
      <ReferralBox code={referralCode} />

      {/* Tabs principales */}
      <div className="flex gap-2 bg-nda-soft rounded-xl p-1">
        <MainTabBtn active={mainTab === "grupos"} onClick={() => setMainTab("grupos")}>
          ⚽ Fase de Grupos
        </MainTabBtn>
        <MainTabBtn active={mainTab === "eliminatorias"} onClick={() => setMainTab("eliminatorias")}>
          🏆 Eliminatorias
        </MainTabBtn>
      </div>

      {/* GRUPOS */}
      {mainTab === "grupos" && (
        <div className="space-y-4">
          {/* Selector de grupo */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {groups.map((letter) => {
              const { done, total } = groupProgress(letter);
              const allDone = done === total && total > 0;
              const isSelected = selectedGroup === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setSelectedGroup(letter)}
                  className={`relative rounded-xl border-2 p-3 text-center transition ${
                    isSelected
                      ? "border-nda-primary bg-nda-primary text-white"
                      : "border-nda-primary/20 bg-white hover:bg-nda-soft"
                  }`}
                >
                  <p className={`text-lg font-extrabold ${isSelected ? "text-white" : "text-nda-dark"}`}>
                    {letter}
                  </p>
                  <p className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-nda-dark/50"}`}>
                    {done}/{total}
                  </p>
                  {allDone && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-nda-accent rounded-full flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Partidos del grupo seleccionado */}
          {selectedGroup && (
            <div>
              <h3 className="font-bold text-nda-dark mb-3">
                Grupo {selectedGroup}
              </h3>
              <div className="space-y-3">
                {filteredMatches.length === 0 ? (
                  <p className="text-center text-nda-dark/60 py-8">
                    No hay partidos cargados para este grupo todavía.
                  </p>
                ) : (
                  filteredMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      prediction={localPreds[m.id] ?? null}
                      onSave={(h, a) => savePrediction(m.id, h, a)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ELIMINATORIAS */}
      {mainTab === "eliminatorias" && (
        <div className="space-y-4">
          {knockoutStages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🗓️</p>
              <p className="text-nda-dark/60 font-medium">Las eliminatorias arrancan cuando termina la fase de grupos.</p>
              <p className="text-sm text-nda-dark/40 mt-1">Cargá tus pronósticos de grupos mientras tanto.</p>
            </div>
          ) : (
            <>
              {/* Selector de fase */}
              <div className="flex gap-2 flex-wrap">
                {knockoutStages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(stage)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
                      selectedStage === stage
                        ? "bg-nda-primary text-white border-nda-primary"
                        : "bg-white text-nda-dark border-nda-primary/20 hover:bg-nda-soft"
                    }`}
                  >
                    {STAGE_LABELS[stage]}
                  </button>
                ))}
              </div>

              {/* Partidos de la fase */}
              <div className="space-y-3">
                {filteredMatches.length === 0 ? (
                  <p className="text-center text-nda-dark/60 py-8">
                    No hay partidos en esta fase todavía.
                  </p>
                ) : (
                  filteredMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      prediction={localPreds[m.id] ?? null}
                      onSave={(h, a) => savePrediction(m.id, h, a)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MainTabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-white text-nda-primary shadow-sm"
          : "text-nda-dark/60 hover:text-nda-dark"
      }`}
    >
      {children}
    </button>
  );
}
