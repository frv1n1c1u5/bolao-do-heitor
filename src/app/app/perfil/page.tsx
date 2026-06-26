import { UserRole } from "@prisma/client";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency, formatPhone } from "@/lib/format";

export default async function PlayerProfilePage() {
  const session = await requireUser([UserRole.PLAYER, UserRole.ADMIN]);
  const rankings = await getDb().poolRanking.findMany({ where: { userId: session.user.id } });
  const totalPrizes = rankings.reduce((sum, ranking) => sum + Number(ranking.prizeAmount), 0);

  return (
    <div className="space-y-4">
      <AppHeader title="Perfil" subtitle="Resumo do seu cadastro e desempenho acumulado." />
      <Card className="space-y-3">
        <div>
          <div className="text-xl font-bold">{session.user.nickname || session.user.name}</div>
          <div className="text-sm text-muted-foreground">{session.user.name} - {formatPhone(session.user.phone)}</div>
        </div>
        <StatusBadge status={session.user.status} />
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bolões no ranking" value={rankings.length} />
        <Stat label="Prêmios ganhos" value={formatCurrency(totalPrizes)} />
        <Stat label="Pontos totais" value={rankings.reduce((sum, ranking) => sum + ranking.totalPoints, 0)} />
        <Stat label="Placares exatos" value={rankings.reduce((sum, ranking) => sum + ranking.exactScores, 0)} />
      </div>
      <Card>
        <p className="section-copy">O reset de PIN é feito pelo administrador.</p>
      </Card>
    </div>
  );
}
