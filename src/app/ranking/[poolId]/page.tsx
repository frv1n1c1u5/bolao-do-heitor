export const dynamic = "force-dynamic";

import Link from "next/link";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export default async function PublicRankingPage({ params }: { params: Promise<{ poolId: string }> }) {
  const { poolId } = await params;
  const pool = await getDb().pool.findUniqueOrThrow({
    where: { id: poolId },
    include: { rankings: { include: { user: true }, orderBy: [{ position: "asc" }, { totalPoints: "desc" }] } },
  });

  return (
    <main className="app-shell flex-1">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-10 pt-6">
        <AppHeader title={`Ranking publico - ${pool.name}`} subtitle="Compartilhe o resultado final do bolao." actions={<StatusBadge status={pool.status} />} />
        <Card className="space-y-3">
          {pool.rankings.map((ranking) => (
            <div key={ranking.id} className="rounded-2xl bg-background/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">#{ranking.position} {ranking.user.nickname || ranking.user.name}</div>
                  <div className="text-sm text-muted-foreground">{ranking.totalPoints} pontos - {ranking.exactScores} exatos</div>
                </div>
                <div className="font-bold text-primary">{formatCurrency(Number(ranking.prizeAmount))}</div>
              </div>
            </div>
          ))}
        </Card>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link className="font-semibold text-primary" href="/entrar">Entrar no Bolao do Heitor</Link>
        </div>
      </div>
    </main>
  );
}
