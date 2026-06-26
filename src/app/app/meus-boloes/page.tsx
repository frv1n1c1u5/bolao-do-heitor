import Link from "next/link";
import { UserRole } from "@prisma/client";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default async function MyPoolsPage() {
  const session = await requireUser(UserRole.PLAYER);
  const entries = await getDb().poolEntry.findMany({
    where: { userId: session.user.id },
    include: { pool: true, predictions: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <AppHeader title="Meus boloes" subtitle="Acompanhe pagamento, quantidade de palpites e acesso r-pido ao ranking." />
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold">{entry.pool.name}</div>
                <div className="text-sm text-muted-foreground">{formatDate(entry.pool.poolDate)}</div>
              </div>
              <StatusBadge status={entry.paymentStatus} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Palpites enviados: {entry.predictions.length}</span>
              <div className="flex gap-3">
                <Link className="font-semibold text-primary" href={`/app/boloes/${entry.poolId}`}>Bolao</Link>
                <Link className="font-semibold text-primary" href={`/app/ranking/${entry.poolId}`}>Ranking</Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
