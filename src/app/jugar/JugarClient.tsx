"use client";

import { useMemo, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { ReferralBox } from "@/components/ReferralBox";
import { createClient } from "@/lib/supabase/client";
import type { Match, Prediction } from "@/lib/supabase/types";

type Props = {
  matches: Match[];
  predictions: Prediction[];
  referralCode: string;
};

type FilterTab = "upcoming" | "live" | "finished";

export function JugarClient({ matches, predictions, referralCode }: Props) {
  const supabase = createClient();
  const [localPreds, setLocalPreds] = useState<Record<number, Prediction>>(() =>
    Object.fromEntries(predictions.map((p) => [p.match_id, p]))
  );
  const [tab, setTab] = useState<FilterTab>("upcoming");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (tab === "upcoming") return m.status === "SCHEDULED";
      if (tab === "live") return m.status === "LIVE";
      return m.status === "FINISHED";
    });
  }, [matches, tab]);

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

      <div className="flex gap-2 border-b border-nda-primary/10 mb-2">
        <Tab active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Próximos</Tab>
        <Tab active={tab === "live"} onClick={() => setTab("live")}>En vivo</Tab>
        <Tab active={tab === "finished"} onClick={() => setTab("finished")}>Terminados</Tab>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-nda-dark/60 py-12">No hay partidos en esta categoría todavía.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              prediction={localPreds[m.id] ?? null}
              onSave={(h, a) => savePrediction(m.id, h, a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
        active
          ? "border-nda-primary text-nda-primary"
          : "border-transparent text-nda-dark/60 hover:text-nda-dark"
      }`}
    >
      {children}
    </button>
  );
}
