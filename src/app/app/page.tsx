import Link from "next/link";
import { ArrowRight, Clock3, ScrollText, Sparkles, Wallet } from "lucide-react";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatTeamName } from "@/lib/country-flags";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getPlayerDashboardData } from "@/lib/pools";
import { UserRole } from "@prisma/client";

export default async function PlayerDashboardPage() {
  const session = await requireUser([UserRole.PLAYER, UserRole.ADMIN]);
  const data = await getPlayerDashboardData(session.user.id);
  const firstPending = data.pendingPayments[0];

  return (
    <div className="space-y-5">
      <AppHeader
        eyebrow="Copa do Mundo 2026"
        title={`Olá, ${session.user.nickname || session.user.name}!`}
        subtitle="Tudo do seu bolão em um só lugar: próximos jogos, pagamentos e palpites do dia."
      />

      {firstPending ? (
        <Card className="rounded-[30px] border-rose-100 bg-[linear-gradient(135deg,rgba(255,237,237,0.98),rgba(255,247,247,0.94))] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="kicker mb-3 bg-rose-100 text-rose-700">Pagamento pendente</div>
              <div className="text-lg font-black text-foreground">{firstPending.pool.name}</div>
              <p className="mt-2 max-w-lg text-sm leading-6 text-rose-700/90">
                Você ainda precisa confirmar {formatCurrency(Number(firstPending.pool.entryFee))} para entrar no ranking oficial.
              </p>
            </div>
            <Link href={`/app/boloes/${firstPending.poolId}`} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-rose-700 shadow-[0_10px_20px_rgba(209,67,67,0.10)]">
              Pagar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bolões abertos" value={data.openPools.length} />
        <Stat label="Meus bolões" value={data.myEntries.length} tone="navy" />
        <Stat label="Pagamentos pendentes" value={data.pendingPayments.length} tone={data.pendingPayments.length ? "rose" : "mint"} />
        <Stat label="Histórico" value={data.history.length} hint="participações encerradas" tone="gold" />
      </div>

      {data.nextMatch ? (
        <Card className="hero-surface overflow-hidden rounded-[32px] border-white/80 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="kicker mb-3">Próximo jogo</div>
              <div className="text-[1.65rem] font-black leading-tight text-foreground sm:text-[1.95rem]">
                {formatTeamName(data.nextMatch.homeTeam)} x {formatTeamName(data.nextMatch.awayTeam)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4 text-secondary" />
                {formatDateTime(data.nextMatch.localDate)}
              </div>
            </div>
            <div className="rounded-[24px] bg-white/85 px-4 py-3 text-right shadow-[0_16px_30px_rgba(10,24,56,0.08)]">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Bom momento</div>
              <div className="mt-1 text-base font-bold text-foreground">Revise seus palpites</div>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-4 rounded-[32px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="kicker mb-3">Bolões do dia</div>
            <h2 className="section-title text-[1.45rem]">Novos bolões</h2>
          </div>
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {data.openPools.length ? data.openPools.map((pool) => {
            const myEntry = pool.entries[0];
            return (
              <div key={pool.id} className="rounded-[28px] bg-white/78 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-foreground">{pool.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{pool.poolMatches.length} jogo(s) • {formatCurrency(Number(pool.entryFee))}</div>
                  </div>
                  <StatusBadge status={pool.status} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {myEntry ? <StatusBadge status={myEntry.paymentStatus} /> : <span className="text-sm text-muted-foreground">Você ainda não entrou</span>}
                  <Link href={`/app/boloes/${pool.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-sm font-bold text-primary">
                    Ver detalhes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          }) : <p className="section-copy">Não há bolões abertos agora.</p>}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[30px] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-secondary" />
            <h2 className="section-title">Seus pagamentos</h2>
          </div>
          <div className="space-y-3">
            {data.pendingPayments.length ? data.pendingPayments.map((entry) => (
              <div key={entry.id} className="rounded-[24px] bg-white/78 p-4">
                <div className="font-bold text-foreground">{entry.pool.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{formatCurrency(Number(entry.pool.entryFee))}</div>
              </div>
            )) : <p className="section-copy">Nenhum pagamento pendente.</p>}
          </div>
        </Card>

        <Card className="rounded-[30px] p-5">
          <div className="mb-4 flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            <h2 className="section-title">Histórico rápido</h2>
          </div>
          <div className="space-y-3">
            {data.history.length ? data.history.slice(0, 3).map((row) => (
              <div key={row.id} className="rounded-[24px] bg-white/78 p-4">
                <div className="font-bold text-foreground">{row.pool.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{row.totalPoints} pts • prêmio {formatCurrency(Number(row.prizeAmount))}</div>
              </div>
            )) : <p className="section-copy">Seu histórico aparece aqui quando os bolões forem encerrados.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
