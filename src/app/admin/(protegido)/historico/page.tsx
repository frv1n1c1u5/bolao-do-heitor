import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { getHallOfFame } from "@/lib/pools";

export default async function AdminHistoryPage() {
  const [finishedPools, hallOfFame] = await Promise.all([
    getDb().pool.findMany({
      where: { status: "FINISHED" },
      include: { poolMatches: { include: { match: true } }, rankings: { include: { user: true }, orderBy: { position: "asc" } } },
      orderBy: { poolDate: "desc" },
    }),
    getHallOfFame(),
  ]);

  return (
    <div className="space-y-4">
      <AppHeader title="Historico" subtitle="Boloes encerrados, vencedores e Hall da Fama acumulado." />
      <Card className="space-y-3">
        <h2 className="section-title">Hall da Fama</h2>
        {hallOfFame.slice(0, 10).map((item, index) => (
          <div key={item.userId} className="flex items-center justify-between rounded-2xl bg-background/70 p-3 text-sm">
            <div>#{index + 1} {item.name}</div>
            <div className="text-right text-muted-foreground">{item.wins} vitorias - {formatCurrency(item.prizes)}</div>
          </div>
        ))}
      </Card>
      <div className="space-y-4">
        {finishedPools.map((pool) => (
          <Card key={pool.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold">{pool.name}</div>
                <div className="text-sm text-muted-foreground">{formatDate(pool.poolDate)} - {pool.poolMatches.length} jogo(s)</div>
              </div>
              <StatusBadge status={pool.status} />
            </div>
            <div className="space-y-2">
              {pool.rankings.map((ranking) => (
                <div key={ranking.id} className="flex items-center justify-between rounded-2xl bg-background/70 p-3 text-sm">
                  <div>#{ranking.position} {ranking.user.nickname || ranking.user.name}</div>
                  <div className="font-semibold">{formatCurrency(Number(ranking.prizeAmount))}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
