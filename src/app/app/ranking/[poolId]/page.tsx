import { UserRole } from "@prisma/client";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export default async function PlayerRankingPage({ params }: { params: Promise<{ poolId: string }> }) {
  await requireUser(UserRole.PLAYER);
  const { poolId } = await params;
  const pool = await getDb().pool.findUniqueOrThrow({
    where: { id: poolId },
    include: {
      rankings: { include: { user: true }, orderBy: [{ position: "asc" }, { totalPoints: "desc" }] },
      entries: { include: { user: true }, where: { paymentStatus: { in: ["PENDING", "WAITING_CONFIRMATION", "REJECTED"] } } },
    },
  });

  return (
    <div className="space-y-4">
      <AppHeader title={`Ranking - ${pool.name}`} subtitle="Apenas participantes confirmados entram no ranking oficial e na premiacao." actions={<StatusBadge status={pool.status} />} />
      <Card className="space-y-3">
        <h2 className="section-title">Ranking oficial</h2>
        {pool.rankings.length ? pool.rankings.map((ranking) => (
          <div key={ranking.id} className="rounded-2xl bg-background/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">#{ranking.position} {ranking.user.nickname || ranking.user.name}</div>
                <div className="text-sm text-muted-foreground">{ranking.totalPoints} pontos - {ranking.exactScores} exatos - {ranking.correctWinners} acertos de vencedor/empate</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{formatCurrency(Number(ranking.prizeAmount))}</div>
                {ranking.isTechnicalTie ? <div className="text-xs text-muted-foreground">Empate tecnico</div> : null}
              </div>
            </div>
          </div>
        )) : <p className="section-copy">Ainda nao ha ranking oficial disponivel.</p>}
      </Card>

      <Card className="space-y-3">
        <h2 className="section-title">Fora do ranking oficial ate confirma--o do pagamento</h2>
        {pool.entries.length ? pool.entries.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-background/70 p-3 text-sm">
            <span>{entry.user.nickname || entry.user.name}</span>
            <StatusBadge status={entry.paymentStatus} />
          </div>
        )) : <p className="section-copy">Nao ha participantes pendentes.</p>}
      </Card>
    </div>
  );
}
