import {
  confirmPaymentAction,
  markPrizePaidAction,
  recalculateRankingAction,
  rejectPaymentAction,
  syncResultsAction,
  updatePoolStatusAction,
} from "@/actions/admin";
import { AppHeader, StatusBadge } from "@/components/app-shell";
import { MatchCard } from "@/components/match-card";
import { Button, Card } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminPoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pool = await getDb().pool.findUniqueOrThrow({
    where: { id },
    include: {
      poolMatches: { include: { match: true } },
      entries: {
        include: {
          user: true,
          predictions: { include: { match: true } },
        },
      },
      rankings: { include: { user: true }, orderBy: [{ position: "asc" }, { totalPoints: "desc" }] },
    },
  });

  return (
    <div className="space-y-4">
      <AppHeader title={pool.name} subtitle={`${pool.type} - ${formatDate(pool.poolDate)} - ${formatCurrency(Number(pool.entryFee))}`} actions={<StatusBadge status={pool.status} />} />

      <Card className="flex flex-wrap gap-2">
        <form action={syncResultsAction}><input type="hidden" name="poolId" value={pool.id} /><Button>Atualizar resultados</Button></form>
        <form action={recalculateRankingAction}><input type="hidden" name="poolId" value={pool.id} /><Button variant="secondary">Recalcular ranking</Button></form>
        <form action={updatePoolStatusAction}><input type="hidden" name="poolId" value={pool.id} /><input type="hidden" name="status" value={pool.status === "OPEN" ? "CLOSED" : "OPEN"} /><Button variant="ghost">{pool.status === "OPEN" ? "Fechar bolao" : "Reabrir bolao"}</Button></form>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="space-y-3">
          <h2 className="section-title">Jogos do bolao</h2>
          {pool.poolMatches.map((poolMatch) => <MatchCard key={poolMatch.id} match={poolMatch.match} rightSlot={<StatusBadge status={poolMatch.match.status} />} />)}
        </Card>

        <Card className="space-y-3">
          <h2 className="section-title">Ranking oficial</h2>
          {pool.rankings.length ? pool.rankings.map((ranking) => (
            <div key={ranking.id} className="rounded-2xl bg-background/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">#{ranking.position} {ranking.user.nickname || ranking.user.name}</div>
                  <div className="text-sm text-muted-foreground">{ranking.totalPoints} pts - {ranking.exactScores} exatos - erro {ranking.totalGoalDifferenceError}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{formatCurrency(Number(ranking.prizeAmount))}</div>
                  {ranking.isTechnicalTie ? <div className="text-xs text-muted-foreground">Empate tecnico</div> : null}
                </div>
              </div>
            </div>
          )) : <p className="section-copy">O ranking aparece quando houver participantes confirmados com palpites completos.</p>}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="space-y-3">
          <h2 className="section-title">Participantes e pagamentos</h2>
          {pool.entries.map((entry) => (
            <div key={entry.id} className="rounded-2xl bg-background/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{entry.user.nickname || entry.user.name}</div>
                  <div className="text-sm text-muted-foreground">Palpites: {entry.predictions.length}/{pool.poolMatches.length}</div>
                </div>
                <StatusBadge status={entry.paymentStatus} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.paymentStatus !== "CONFIRMED" ? (
                  <form action={confirmPaymentAction}><input type="hidden" name="entryId" value={entry.id} /><Button>Confirmar</Button></form>
                ) : null}
                {entry.paymentStatus !== "REJECTED" ? (
                  <form action={rejectPaymentAction}><input type="hidden" name="entryId" value={entry.id} /><Button variant="danger">Recusar</Button></form>
                ) : null}
                {entry.prizeStatus === "PENDING" ? (
                  <form action={markPrizePaidAction}><input type="hidden" name="entryId" value={entry.id} /><Button variant="secondary">Marcar premio pago</Button></form>
                ) : null}
              </div>
            </div>
          ))}
        </Card>

        <Card className="space-y-3">
          <h2 className="section-title">Palpites</h2>
          {pool.poolMatches.map((poolMatch) => (
            <div key={poolMatch.id} className="rounded-2xl bg-background/70 p-3">
              <div className="font-semibold">{poolMatch.match.homeTeam} x {poolMatch.match.awayTeam}</div>
              <div className="mt-2 space-y-2 text-sm">
                {pool.entries.map((entry) => {
                  const prediction = entry.predictions.find((item) => item.matchId === poolMatch.matchId);
                  return (
                    <div key={entry.id} className="flex items-center justify-between">
                      <span>{entry.user.nickname || entry.user.name}</span>
                      <span className="font-semibold">{prediction ? `${prediction.predictedHomeScore} x ${prediction.predictedAwayScore}` : "Sem palpite"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
