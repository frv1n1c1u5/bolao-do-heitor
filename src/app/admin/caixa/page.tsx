import { markPrizePaidAction } from "@/actions/admin";
import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Button, Card, Stat } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminCashPage() {
  const pools = await getDb().pool.findMany({
    include: {
      entries: { include: { user: true } },
      rankings: { include: { user: true }, orderBy: { position: "asc" } },
    },
    orderBy: { poolDate: "desc" },
  });

  const totals = pools.reduce((acc, pool) => {
    const confirmed = pool.entries.filter((entry) => entry.paymentStatus === "CONFIRMED").length;
    const gross = confirmed * Number(pool.entryFee);
    acc.gross += gross;
    acc.house += gross * (Number(pool.houseFeePercentage) / 100);
    acc.prizes += gross * (Number(pool.prizePercentage) / 100);
    acc.pending += pool.entries.filter((entry) => entry.prizeStatus === "PENDING").length;
    return acc;
  }, { gross: 0, house: 0, prizes: 0, pending: 0 });

  return (
    <div className="space-y-4">
      <AppHeader title="Caixa" subtitle="Controle de arrecadacao, repasse da casa e premios pagos ou pendentes." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total arrecadado" value={formatCurrency(totals.gross)} />
        <Stat label="Casa" value={formatCurrency(totals.house)} />
        <Stat label="Premios" value={formatCurrency(totals.prizes)} />
        <Stat label="Premios pendentes" value={totals.pending} />
      </div>
      <div className="space-y-4">
        {pools.map((pool) => {
          const confirmed = pool.entries.filter((entry) => entry.paymentStatus === "CONFIRMED").length;
          const gross = confirmed * Number(pool.entryFee);
          const house = gross * (Number(pool.houseFeePercentage) / 100);
          const prize = gross * (Number(pool.prizePercentage) / 100);
          return (
            <Card key={pool.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold">{pool.name}</div>
                  <div className="text-sm text-muted-foreground">{formatDate(pool.poolDate)}</div>
                </div>
                <StatusBadge status={pool.status} />
              </div>
              <div className="grid gap-2 sm:grid-cols-3 text-sm">
                <div className="rounded-xl bg-background/70 p-3">Bruto: <strong>{formatCurrency(gross)}</strong></div>
                <div className="rounded-xl bg-background/70 p-3">Casa: <strong>{formatCurrency(house)}</strong></div>
                <div className="rounded-xl bg-background/70 p-3">Premio: <strong>{formatCurrency(prize)}</strong></div>
              </div>
              <div className="space-y-2">
                {pool.rankings.map((ranking) => {
                  const entry = pool.entries.find((item) => item.userId === ranking.userId);
                  return (
                    <div key={ranking.id} className="flex items-center justify-between rounded-xl bg-background/70 p-3 text-sm">
                      <div>
                        #{ranking.position} {ranking.user.nickname || ranking.user.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(Number(ranking.prizeAmount))}</span>
                        {entry?.prizeStatus === "PENDING" ? <form action={markPrizePaidAction}><input type="hidden" name="entryId" value={entry.id} /><Button variant="secondary">Pago</Button></form> : entry ? <StatusBadge status={entry.prizeStatus} /> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
