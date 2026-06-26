import Link from "next/link";

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

  return (
    <div className="space-y-4">
      <AppHeader title={`Olá, ${session.user.nickname || session.user.name}`} subtitle="Acompanhe bolões abertos, seus pagamentos e o próximo jogo." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bolões abertos" value={data.openPools.length} />
        <Stat label="Meus bolões" value={data.myEntries.length} />
        <Stat label="Pagamentos pendentes" value={data.pendingPayments.length} />
        <Stat label="Histórico" value={data.history.length} hint="Bolões encerrados" />
      </div>

      {data.nextMatch ? (
        <Card>
          <div className="text-sm font-semibold text-primary">Próximo jogo começando</div>
          <div className="mt-2 text-xl font-black">{formatTeamName(data.nextMatch.homeTeam)} x {formatTeamName(data.nextMatch.awayTeam)}</div>
          <div className="mt-1 text-sm text-muted-foreground">{formatDateTime(data.nextMatch.localDate)}</div>
        </Card>
      ) : null}

      <Card className="space-y-3">
        <h2 className="section-title">Bolões abertos</h2>
        <div className="space-y-3">
          {data.openPools.length ? data.openPools.map((pool) => {
            const myEntry = pool.entries[0];
            return (
              <div key={pool.id} className="rounded-2xl bg-background/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{pool.name}</div>
                    <div className="text-sm text-muted-foreground">{pool.poolMatches.length} jogo(s) - {formatCurrency(Number(pool.entryFee))}</div>
                  </div>
                  <StatusBadge status={pool.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {myEntry ? <StatusBadge status={myEntry.paymentStatus} /> : <div className="text-sm text-muted-foreground">Você ainda não entrou.</div>}
                  <Link className="text-sm font-semibold text-primary" href={`/app/boloes/${pool.id}`}>Abrir bolão</Link>
                </div>
              </div>
            );
          }) : <p className="section-copy">Não há bolões abertos agora.</p>}
        </div>
      </Card>
    </div>
  );
}
