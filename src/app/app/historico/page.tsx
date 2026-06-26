import { UserRole } from "@prisma/client";

import { AppHeader } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function PlayerHistoryPage() {
  const session = await requireUser(UserRole.PLAYER);
  const rankings = await getDb().poolRanking.findMany({
    where: { userId: session.user.id, pool: { status: "FINISHED" } },
    include: { pool: true },
    orderBy: { updatedAt: "desc" },
  });

  const totals = rankings.reduce((acc, ranking) => {
    acc.prizes += Number(ranking.prizeAmount);
    acc.points += ranking.totalPoints;
    acc.exacts += ranking.exactScores;
    if (ranking.position === 1) acc.wins += 1;
    return acc;
  }, { prizes: 0, points: 0, exacts: 0, wins: 0 });

  return (
    <div className="space-y-4">
      <AppHeader title="Historico" subtitle="Somente participacoes oficiais com pagamento confirmado entram aqui." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Boloes oficiais" value={rankings.length} />
        <Stat label="Vitorias" value={totals.wins} />
        <Stat label="Premios" value={formatCurrency(totals.prizes)} />
        <Stat label="Pontos" value={totals.points} />
      </div>
      <div className="space-y-4">
        {rankings.map((ranking) => (
          <Card key={ranking.id} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{ranking.pool.name}</div>
              <div className="text-sm text-muted-foreground">{formatDate(ranking.pool.poolDate)} - posicao #{ranking.position}</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-bold text-primary">{formatCurrency(Number(ranking.prizeAmount))}</div>
              <div className="text-muted-foreground">{ranking.totalPoints} pts</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
