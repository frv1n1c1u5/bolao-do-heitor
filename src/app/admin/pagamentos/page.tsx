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

  return (
    <div className="space-y-4">
      <AppHeader title="Pagamentos" subtitle="Confirma--o manual de Pix. Apenas confirmados entram no ranking oficial." />
      <Card className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-2xl bg-background/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{entry.user.nickname || entry.user.name}</div>
                <div className="text-sm text-muted-foreground">{entry.pool.name} - {formatPhone(entry.user.phone)}</div>
                <div className="text-sm text-muted-foreground">Valor: {formatCurrency(Number(entry.pool.entryFee))}</div>
                {entry.markedAsPaidAt ? <div className="text-sm text-muted-foreground">Ja paguei: {formatDateTime(entry.markedAsPaidAt)}</div> : null}
              </div>
              <StatusBadge status={entry.paymentStatus} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.paymentStatus !== "CONFIRMED" ? <form action={confirmPaymentAction}><input type="hidden" name="entryId" value={entry.id} /><Button>Confirmar</Button></form> : null}
              {entry.paymentStatus !== "REJECTED" ? <form action={rejectPaymentAction}><input type="hidden" name="entryId" value={entry.id} /><Button variant="danger">Recusar</Button></form> : null}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
