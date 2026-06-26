"use client";

import { CalendarDays, ListFilter, Search, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/app-shell";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatTeamName } from "@/lib/country-flags";

type MatchPickerItem = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competitionName: string;
  localDateLabel: string;
  status: string;
  startsAt: string;
};

const viewOptions = [
  { key: "upcoming", label: "Proximos" },
  { key: "all", label: "Todos" },
  { key: "finished", label: "Finalizados" },
] as const;

const statusOptions = [
  { key: "all", label: "Todos os status" },
  { key: "scheduled", label: "Agendados" },
  { key: "live", label: "Ao vivo" },
  { key: "finished", label: "Finalizados" },
] as const;

function matchesStatus(status: string, filter: (typeof statusOptions)[number]["key"]) {
  if (filter === "all") return true;
  if (filter === "scheduled") return status === "SCHEDULED" || status === "TIMED";
  if (filter === "live") return status === "IN_PLAY" || status === "PAUSED";
  if (filter === "finished") return status === "FINISHED";
  return true;
}

export function MatchPicker({
  matches,
  inputName,
}: {
  matches: MatchPickerItem[];
  inputName: string;
}) {
  const [view, setView] = useState<(typeof viewOptions)[number]["key"]>("upcoming");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    const now = Date.now();

    return matches.filter((match) => {
      const startsAt = new Date(match.startsAt).getTime();
      const inView =
        view === "all"
          ? true
          : view === "finished"
            ? match.status === "FINISHED"
            : startsAt >= now || (match.status !== "FINISHED" && match.status !== "CANCELED");

      if (!inView) return false;
      if (!matchesStatus(match.status, statusFilter)) return false;

      if (!normalizedQuery) return true;
      const haystack = `${match.homeTeam} ${match.awayTeam} ${match.competitionName}`.toLocaleLowerCase(
        "pt-BR",
      );
      return haystack.includes(normalizedQuery);
    });
  }, [matches, query, statusFilter, view]);

  return (
    <div className="space-y-3 rounded-2xl bg-background/70 p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {viewOptions.map((option) => (
            <Button
              key={option.key}
              type="button"
              variant={view === option.key ? "primary" : "ghost"}
              className="min-h-10 rounded-full px-3 text-xs"
              onClick={() => setView(option.key)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-muted-foreground dark:bg-slate-950/35">
          <Trophy className="h-4 w-4 text-primary" />
          {selectedIds.length} jogo(s) selecionado(s)
        </div>
      </div>

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={inputName} value={id} />
      ))}

      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por time ou competicao"
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setStatusFilter(option.key)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition",
                statusFilter === option.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-slate-300/50 bg-white/85 text-foreground dark:bg-slate-950/35",
              )}
            >
              <ListFilter className="h-3.5 w-3.5" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredMatches.length ? (
          filteredMatches.map((match) => {
            const checked = selectedIds.includes(match.id);
            return (
              <label
                key={match.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition",
                  checked
                    ? "border-primary bg-primary/8 shadow-sm"
                    : "border-slate-200/70 bg-white/85 dark:border-slate-800 dark:bg-slate-950/30",
                )}
              >
                <input
                  type="checkbox"
                  value={match.id}
                  checked={checked}
                  onChange={(event) => {
                    setSelectedIds((current) =>
                      event.target.checked
                        ? [...current, match.id]
                        : current.filter((item) => item !== match.id),
                    );
                  }}
                  className="mt-1 h-4 w-4"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-base font-bold text-foreground">
                        {formatTeamName(match.homeTeam)} x {formatTeamName(match.awayTeam)}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {match.competitionName}
                      </div>
                    </div>
                    <StatusBadge status={match.status} />
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {match.localDateLabel}
                  </div>
                </div>
              </label>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300/60 bg-white/60 p-4 text-sm text-muted-foreground dark:bg-slate-950/20">
            Nenhum jogo encontrado com esse filtro.
          </div>
        )}
      </div>
    </div>
  );
}
