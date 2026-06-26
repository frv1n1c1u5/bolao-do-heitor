import Link from "next/link";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card, Stat } from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/pools";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-4">
      <AppHeader
        title="Dashboard"
        subtitle="Visao rapida dos jogos, pagamentos, caixa e Ultimos vencedores."
        actions={<Link className="badge bg-primary text-primary-foreground" href="/admin/boloes/novo">Novo bolao</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Arrecadacao hoje" value={formatCurrency(data.totals.gross)} />
        <Stat label="Casa hoje" value={formatCurrency(data.totals.house)} />
        <Stat label="Premios hoje" value={formatCurrency(data.totals.prize)} />
        <Stat label="Pagamentos pendentes" value={data.pendingPayments.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-3">
          <h2 className="section-title">Jogos de hoje</h2>
          <div className="space-y-3">
            {data.matchesToday.length ? data.matchesToday.map((match) => (
              <div key={match.id} className="rounded-2xl bg-background/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{match.homeTeam} x {match.awayTeam}</div>
                    <div className="text-sm text-muted-foreground">{formatDateTime(match.localDate)}</div>
                  </div>
                  <StatusBadge status={match.status} />
                </div>
              </div>
            )) : <p className="section-copy">Nenhum jogo salvo para hoje.</p>}
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="section-title">Pagamentos aguardando confirmação</h2>
          <div className="space-y-3">
            {data.pendingPayments.length ? data.pendingPayments.map((entry) => (
              <div key={entry.id} className="rounded-2xl bg-background/70 p-3">
                <div className="font-semibold">{entry.user.nickname || entry.user.name}</div>
                <div className="text-sm text-muted-foreground">{entry.pool.name}</div>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={entry.paymentStatus} />
                  <Link className="text-sm font-semibold text-primary" href="/admin/pagamentos">Abrir</Link>
                </div>
              </div>
            )) : <p className="section-copy">Sem pagamentos aguardando confirmação.</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="section-title">Boloes recentes</h2>
          <div className="space-y-3">
            {data.pools.map((pool) => (
              <div key={pool.id} className="rounded-2xl bg-background/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{pool.name}</div>
                    <div className="text-sm text-muted-foreground">{pool.type} - {pool.entries.length} participantes</div>
                  </div>
                  <StatusBadge status={pool.status} />
                </div>
                <div className="mt-2 text-right">
                  <Link className="text-sm font-semibold text-primary" href={`/admin/boloes/${pool.id}`}>Ver detalhes</Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="section-title">Ultimos vencedores</h2>
          <div className="space-y-3">
            {data.recentWinners.length ? data.recentWinners.map((winner) => (
              <div key={winner.id} className="rounded-2xl bg-background/70 p-3">
                <div className="font-semibold">{winner.user.nickname || winner.user.name}</div>
                <div className="text-sm text-muted-foreground">{winner.pool.name}</div>
                <div className="mt-1 text-sm font-semibold text-primary">{formatCurrency(Number(winner.prizeAmount))}</div>
              </div>
            )) : <p className="section-copy">Ainda nao ha boloes encerrados.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

