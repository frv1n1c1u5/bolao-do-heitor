import { UserRole } from "@prisma/client";
import { Crown, Medal, Share2 } from "lucide-react";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card, Button } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export default async function PlayerRankingPage({ params }: { params: Promise<{ poolId: string }> }) {
  await requireUser([UserRole.PLAYER, UserRole.ADMIN]);
  const { poolId } = await params;
  const pool = await getDb().pool.findUniqueOrThrow({
    where: { id: poolId },
    include: {
      rankings: { include: { user: true }, orderBy: [{ position: "asc" }, { totalPoints: "desc" }] },
      entries: { include: { user: true }, where: { paymentStatus: { in: ["PENDING", "WAITING_CONFIRMATION", "REJECTED"] } } },
    },
  });

  const podium = pool.rankings.slice(0, 3);

  return (
    <div className="space-y-5">
      <AppHeader
        eyebrow="Resultado do bolão"
        title={`Ranking • ${pool.name}`}
        subtitle="Apenas participantes confirmados entram no ranking oficial e na premiação."
        actions={<StatusBadge status={pool.status} />}
      />

      {podium.length ? (
        <Card className="hero-surface rounded-[34px] border-white/80 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="kicker mb-3">Pódio</div>
              <h2 className="section-title text-[1.45rem]">Quem liderou o dia</h2>
            </div>
            <Crown className="h-6 w-6 text-accent" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {podium.map((ranking, index) => (
              <div key={ranking.id} className={`rounded-[28px] p-4 ${index === 0 ? "bg-primary text-primary-foreground shadow-[0_22px_42px_rgba(13,27,54,0.18)]" : "bg-white/82"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] ${index === 0 ? "bg-white/14 text-white" : "bg-amber-50 text-amber-700"}`}>
                    <Medal className="h-5 w-5" />
                  </div>
                  <div className={`text-xs font-extrabold uppercase tracking-[0.12em] ${index === 0 ? "text-white/70" : "text-muted-foreground"}`}>#{ranking.position}</div>
                </div>
                <div className={`mt-4 text-xl font-black ${index === 0 ? "text-white" : "text-foreground"}`}>{ranking.user.nickname || ranking.user.name}</div>
                <div className={`mt-1 text-sm ${index === 0 ? "text-white/78" : "text-muted-foreground"}`}>{ranking.totalPoints} pts • {ranking.exactScores} exatos</div>
                <div className={`mt-4 text-lg font-black ${index === 0 ? "text-white" : "text-primary"}`}>{formatCurrency(Number(ranking.prizeAmount))}</div>
                {ranking.isTechnicalTie ? <div className={`mt-1 text-xs ${index === 0 ? "text-white/70" : "text-muted-foreground"}`}>Empate técnico</div> : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="rounded-[32px] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="kicker mb-3">Ranking oficial</div>
            <h2 className="section-title text-[1.4rem]">Classificação completa</h2>
          </div>
          <Button type="button" className="min-h-11 rounded-2xl px-4" onClick={() => {}}>
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
        <div className="space-y-3">
          {pool.rankings.length ? pool.rankings.map((ranking) => (
            <div key={ranking.id} className="rounded-[26px] bg-white/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-foreground">#{ranking.position} {ranking.user.nickname || ranking.user.name}</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">
                    {ranking.totalPoints} pontos • {ranking.exactScores} placares exatos • {ranking.correctWinners} acertos de vencedor/empate
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-primary">{formatCurrency(Number(ranking.prizeAmount))}</div>
                  {ranking.isTechnicalTie ? <div className="mt-1 text-xs text-muted-foreground">Empate técnico</div> : null}
                </div>
              </div>
            </div>
          )) : <p className="section-copy">Ainda não há ranking oficial disponível.</p>}
        </div>
      </Card>

      <Card className="rounded-[32px] p-5 sm:p-6">
        <div className="kicker mb-3">Aguardando confirmação</div>
        <h2 className="section-title text-[1.35rem]">Fora do ranking oficial</h2>
        <p className="section-copy mt-2">Esses participantes só entram na classificação e na premiação depois da confirmação do pagamento.</p>
        <div className="mt-4 space-y-3">
          {pool.entries.length ? pool.entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[24px] bg-white/80 p-4 text-sm">
              <span className="font-semibold text-foreground">{entry.user.nickname || entry.user.name}</span>
              <StatusBadge status={entry.paymentStatus} />
            </div>
          )) : <p className="section-copy">Não há participantes pendentes.</p>}
        </div>
      </Card>
    </div>
  );
}
