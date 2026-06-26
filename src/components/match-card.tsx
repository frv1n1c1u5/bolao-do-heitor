import Image from "next/image";

import { Card } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

export function MatchCard({
  match,
  rightSlot,
}: {
  match: {
    id: string;
    competitionName: string;
    homeTeam: string;
    awayTeam: string;
    homeCrest?: string | null;
    awayCrest?: string | null;
    localDate: Date;
    status: string;
    homeScore?: number | null;
    awayScore?: number | null;
  };
  rightSlot?: React.ReactNode;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{match.competitionName}</div>
          <div className="mt-1 text-sm text-muted-foreground">{formatDateTime(match.localDate)}</div>
        </div>
        {rightSlot}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-3">
          {match.homeCrest ? (
            <Image src={match.homeCrest} alt={match.homeTeam} width={36} height={36} className="h-9 w-9 rounded-full bg-white object-contain p-1" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-black">{match.homeTeam.slice(0, 2).toUpperCase()}</div>
          )}
          <div className="min-w-0 text-sm font-semibold">{match.homeTeam}</div>
        </div>
        <div className="rounded-xl bg-background/80 px-3 py-2 text-center text-sm font-black">
          {match.homeScore ?? "-"} x {match.awayScore ?? "-"}
        </div>
        <div className="flex items-center justify-end gap-3">
          <div className="min-w-0 text-right text-sm font-semibold">{match.awayTeam}</div>
          {match.awayCrest ? (
            <Image src={match.awayCrest} alt={match.awayTeam} width={36} height={36} className="h-9 w-9 rounded-full bg-white object-contain p-1" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-black">{match.awayTeam.slice(0, 2).toUpperCase()}</div>
          )}
        </div>
      </div>
    </Card>
  );
}
