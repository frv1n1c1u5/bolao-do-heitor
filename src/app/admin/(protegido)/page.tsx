import Link from "next/link";
import { ArrowRight, CircleDollarSign, Crown, Medal, Plus, Trophy, Wallet } from "lucide-react";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { formatTeamName } from "@/lib/country-flags";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/pools";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-5">
      <AppHeader
        eyebrow="Painel da Copa"
        title="Controle do dia"
        subtitle="Tudo que importa para operar o bolão: jogos, caixa, pagamentos e últimos vencedores."
        actions={<Link className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground shadow-[0_16px_30px_rgba(0,135,90,0.22)]" href="/admin/boloes/novo"><Plus className="h-4 w-4" />Novo bolão</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Arrecadação hoje" value={formatCurrency(data.totals.gross)} tone="navy" hint="movimento confirmado" />
        <Stat label="Casa hoje" value={formatCurrency(data.totals.house)} tone="default" />
        <Stat label="Prêmios hoje" value={formatCurrency(data.totals.prize)} tone="mint" />
        <Stat label="Pagamentos pendentes" value={data.pendingPayments.length} tone={data.pendingPayments.length ? "rose" : "gold"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="hero-surface rounded-[32px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="kicker mb-3">Jogos do dia</div>
              <h2 className="section-title text-[1.45rem]">Agenda da Copa</h2>
            </div>
            <Trophy className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-5 space-y-3">
            {data.matchesToday.length ? data.matchesToday.map((match) => (
              <div key={match.id} className="rounded-[26px] bg-white/82 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-black text-foreground">{formatTeamName(match.homeTeam)} x {formatTeamName(match.awayTeam)}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{formatDateTime(match.localDate)}</div>
                  </div>
                  <StatusBadge status={match.status} />
                </div>
              </div>
            )) : <p className="section-copy">Nenhum jogo salvo para hoje.</p>}
          </div>
        </Card>

        <Card className="rounded-[32px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="kicker mb-3">Ação rápida</div>
              <h2 className="section-title text-[1.35rem]">Pagamentos aguardando confirmação</h2>
            </div>
            <CircleDollarSign className="h-5 w-5 text-secondary" />
          </div>
          <div className="mt-5 space-y-3">
            {data.pendingPayments.length ? data.pendingPayments.map((entry) => (
              <div key={entry.id} className="rounded-[24px] bg-white/80 p-4">
                <div className="font-black text-foreground">{entry.user.nickname || entry.user.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{entry.pool.name}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <StatusBadge status={entry.paymentStatus} />
                  <Link className="inline-flex items-center gap-2 text-sm font-bold text-primary" href="/admin/pagamentos">
                    Abrir
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )) : <p className="section-copy">Sem pagamentos aguardando confirmação.</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-[32px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="kicker mb-3">Visão de operação</div>
              <h2 className="section-title text-[1.35rem]">Bolões recentes</h2>
            </div>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 space-y-3">
            {data.pools.map((pool) => (
              <div key={pool.id} className="rounded-[26px] bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-foreground">{pool.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{pool.type} • {pool.entries.length} participantes</div>
                  </div>
                  <StatusBadge status={pool.status} />
                </div>
                <div className="mt-3 text-right">
                  <Link className="inline-flex items-center gap-2 text-sm font-bold text-primary" href={`/admin/boloes/${pool.id}`}>
                    Ver detalhes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[32px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="kicker mb-3">Hall do dia</div>
              <h2 className="section-title text-[1.35rem]">Últimos vencedores</h2>
            </div>
            <Crown className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-5 space-y-3">
            {data.recentWinners.length ? data.recentWinners.map((winner) => (
              <div key={winner.id} className="rounded-[26px] bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-foreground">{winner.user.nickname || winner.user.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{winner.pool.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-primary">{formatCurrency(Number(winner.prizeAmount))}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-accent"><Medal className="h-3.5 w-3.5" /> campeão</div>
                  </div>
                </div>
              </div>
            )) : <p className="section-copy">Ainda não há bolões encerrados.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
