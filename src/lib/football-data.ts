import "server-only";

import { MatchStatus, Winner } from "@prisma/client";
import { toZonedTime } from "date-fns-tz";

import { env } from "@/lib/env";

type FootballMatch = {
  id: number;
  utcDate: string;
  status: string;
  competition?: {
    name?: string;
    code?: string;
  };
  homeTeam?: {
    name?: string;
    crest?: string;
  };
  awayTeam?: {
    name?: string;
    crest?: string;
  };
  score?: {
    winner?: "HOME_TEAM" | "DRAW" | "AWAY_TEAM";
    fullTime?: { home?: number | null; away?: number | null };
  };
};

function toMatchStatus(status?: string): MatchStatus {
  switch (status) {
    case "SCHEDULED":
      return MatchStatus.SCHEDULED;
    case "TIMED":
      return MatchStatus.TIMED;
    case "IN_PLAY":
      return MatchStatus.IN_PLAY;
    case "PAUSED":
      return MatchStatus.PAUSED;
    case "FINISHED":
      return MatchStatus.FINISHED;
    case "POSTPONED":
      return MatchStatus.POSTPONED;
    case "CANCELLED":
      return MatchStatus.CANCELED;
    case "SUSPENDED":
      return MatchStatus.SUSPENDED;
    default:
      return MatchStatus.UNKNOWN;
  }
}

function toWinner(winner?: string): Winner {
  switch (winner) {
    case "HOME_TEAM":
      return Winner.HOME;
    case "DRAW":
      return Winner.DRAW;
    case "AWAY_TEAM":
      return Winner.AWAY;
    default:
      return Winner.UNKNOWN;
  }
}

async function footballFetch<T>(path: string) {
  if (!env.FOOTBALL_DATA_API_KEY) {
    throw new Error("FOOTBALL_DATA_API_KEY nao configurada.");
  }

  const response = await fetch(`${env.FOOTBALL_DATA_BASE_URL}${path}`, {
    headers: {
      "X-Auth-Token": env.FOOTBALL_DATA_API_KEY,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`football-data.org respondeu ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function fetchMatches(params: {
  dateFrom?: string;
  dateTo?: string;
  competition?: string;
  status?: string;
}) {
  const search = new URLSearchParams();
  if (params.dateFrom) search.set("dateFrom", params.dateFrom);
  if (params.dateTo) search.set("dateTo", params.dateTo);
  if (params.competition) search.set("competitions", params.competition);
  if (params.status) search.set("status", params.status);

  const result = await footballFetch<{ matches: FootballMatch[] }>(
    `/matches?${search.toString()}`,
  );

  return result.matches.map(mapExternalMatch);
}

export async function fetchMatchById(externalApiId: number) {
  const result = await footballFetch<FootballMatch>(`/matches/${externalApiId}`);
  return mapExternalMatch(result);
}

export function mapExternalMatch(match: FootballMatch) {
  return {
    externalApiId: match.id,
    competitionName: match.competition?.name ?? "Competicao",
    competitionCode: match.competition?.code ?? null,
    homeTeam: match.homeTeam?.name ?? "Mandante",
    awayTeam: match.awayTeam?.name ?? "Visitante",
    homeCrest: match.homeTeam?.crest ?? null,
    awayCrest: match.awayTeam?.crest ?? null,
    utcDate: new Date(match.utcDate),
    localDate: toZonedTime(match.utcDate, "America/Sao_Paulo"),
    status: toMatchStatus(match.status),
    homeScore: match.score?.fullTime?.home ?? null,
    awayScore: match.score?.fullTime?.away ?? null,
    winner: toWinner(match.score?.winner),
    rawApiPayload: match,
  };
}
