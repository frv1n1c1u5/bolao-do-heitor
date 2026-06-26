import { confirmPaymentAction, rejectPaymentAction } from "@/actions/admin";
import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Button, Card } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatCurrency, formatDateTime, formatPhone } from "@/lib/format";

export default async function AdminPaymentsPage() {
  const entries = await getDb().poolEntry.findMany({
    where: { paymentStatus: { in: ["PENDING", "WAITING_CONFIRMATION", "REJECTED", "CONFIRMED"] } },
    include: { user: true, pool: true },
    orderBy: [{ paymentStatus: "asc" }, { updatedAt: "desc" }],
  });

  const waiting = entries.filter((entry) => entry.paymentStatus === "WAITING_CONFIRMATION");
  const pending = entries.filter((entry) => entry.paymentStatus === "PENDING");
  const reviewed = entries.filter((entry) => entry.paymentStatus === "CONFIRMED" || entry.paymentStatus === "REJECTED");

  return (
    <div className="space-y-5">
      <AppHeader
        eyebrow="Operação financeira"
        title="Pagamentos"
        subtitle="Confirmação manual de Pix. Apenas confirmados entram no ranking oficial."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-[28px] bg-[linear-gradient(135deg,rgba(255,244,214,0.96),rgba(255,250,236,0.92))] p-4">
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Aguardando confirmação</div>
          <div className="mt-3 text-[2rem] font-black text-foreground">{waiting.length}</div>
        </Card>
        <Card className="rounded-[28px] p-4">
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Pendentes</div>
          <div className="mt-3 text-[2rem] font-black text-foreground">{pending.length}</div>
        </Card>
        <Card className="rounded-[28px] bg-[linear-gradient(135deg,rgba(233,242,255,0.96),rgba(247,250,255,0.92))] p-4">
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Revisados</div>
          <div className="mt-3 text-[2rem] font-black text-foreground">{reviewed.length}</div>
        </Card>
      </div>

      <Card className="rounded-[32px] p-5 sm:p-6">
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-[28px] bg-white/82 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-lg font-black text-foreground">{entry.user.nickname || entry.user.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{entry.pool.name} • {formatPhone(entry.user.phone)}</div>
                  <div className="mt-3 text-[1.7rem] font-black text-primary">{formatCurrency(Number(entry.pool.entryFee))}</div>
                  {entry.markedAsPaidAt ? <div className="mt-2 text-sm text-muted-foreground">Já paguei: {formatDateTime(entry.markedAsPaidAt)}</div> : null}
                </div>
                <StatusBadge status={entry.paymentStatus} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {entry.paymentStatus !== "CONFIRMED" ? <form action={confirmPaymentAction}><input type="hidden" name="entryId" value={entry.id} /><Button>Confirmar</Button></form> : null}
                {entry.paymentStatus !== "REJECTED" ? <form action={rejectPaymentAction}><input type="hidden" name="entryId" value={entry.id} /><Button variant="ghost">Recusar</Button></form> : null}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
