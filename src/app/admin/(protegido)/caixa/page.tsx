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
    <div className="space-y-5">
      <AppHeader
        eyebrow="Caixa do bolão"
        title="Resumo financeiro"
        subtitle="Acompanhe arrecadação, parte da casa, prêmio líquido e repasses pendentes."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total arrecadado" value={formatCurrency(totals.gross)} tone="navy" hint="somando bolões confirmados" />
        <Stat label="Casa 30%" value={formatCurrency(totals.house)} />
        <Stat label="Prêmio 70%" value={formatCurrency(totals.prizes)} tone="mint" />
        <Stat label="Prêmios pendentes" value={totals.pending} tone="gold" />
      </div>

      <div className="space-y-4">
        {pools.map((pool) => {
          const confirmed = pool.entries.filter((entry) => entry.paymentStatus === "CONFIRMED").length;
          const gross = confirmed * Number(pool.entryFee);
          const house = gross * (Number(pool.houseFeePercentage) / 100);
          const prize = gross * (Number(pool.prizePercentage) / 100);
          return (
            <Card key={pool.id} className="rounded-[32px] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="kicker mb-3">{formatDate(pool.poolDate)}</div>
                  <div className="text-[1.45rem] font-black text-foreground">{pool.name}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{confirmed} pagamento(s) confirmados</div>
                </div>
                <StatusBadge status={pool.status} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] bg-slate-50 p-4 text-sm"><div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Bruto</div><div className="mt-2 text-xl font-black text-foreground">{formatCurrency(gross)}</div></div>
                <div className="rounded-[24px] bg-slate-50 p-4 text-sm"><div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Casa</div><div className="mt-2 text-xl font-black text-foreground">{formatCurrency(house)}</div></div>
                <div className="rounded-[24px] bg-emerald-50 p-4 text-sm"><div className="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-700">Prêmio</div><div className="mt-2 text-xl font-black text-secondary">{formatCurrency(prize)}</div></div>
              </div>

              <div className="mt-5 space-y-3">
                {pool.rankings.map((ranking) => {
                  const entry = pool.entries.find((item) => item.userId === ranking.userId);
                  return (
                    <div key={ranking.id} className="flex flex-col gap-3 rounded-[24px] bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-black text-foreground">#{ranking.position} {ranking.user.nickname || ranking.user.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{ranking.totalPoints} pts • {ranking.exactScores} exatos</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-black text-primary">{formatCurrency(Number(ranking.prizeAmount))}</span>
                        {entry?.prizeStatus === "PENDING"
                          ? <form action={markPrizePaidAction}><input type="hidden" name="entryId" value={entry.id} /><Button variant="secondary">Marcar como pago</Button></form>
                          : entry ? <StatusBadge status={entry.prizeStatus} /> : null}
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
