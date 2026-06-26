import Link from "next/link";
import { UserRole } from "@prisma/client";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function PlayerPoolsPage() {
  const session = await requireUser([UserRole.PLAYER, UserRole.ADMIN]);
  const pools = await getDb().pool.findMany({
    where: { status: { in: ["OPEN", "CLOSED", "IN_PROGRESS"] } },
    include: { entries: { where: { userId: session.user.id } }, poolMatches: true },
    orderBy: { poolDate: "asc" },
  });

  return (
    <div className="space-y-4">
      <AppHeader title="Bolões abertos" subtitle="Entre no bolão, faça o Pix e envie seus palpites antes do início de cada jogo." />
      <div className="space-y-4">
        {pools.map((pool) => {
          const entry = pool.entries[0];
          return (
            <Card key={pool.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold">{pool.name}</div>
                  <div className="text-sm text-muted-foreground">{pool.type} - {formatDate(pool.poolDate)} - {pool.poolMatches.length} jogo(s)</div>
                </div>
                <StatusBadge status={pool.status} />
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="text-muted-foreground">Participação: <span className="font-semibold text-foreground">{formatCurrency(Number(pool.entryFee))}</span></div>
                {entry ? <StatusBadge status={entry.paymentStatus} /> : <div className="text-muted-foreground">Você ainda não entrou</div>}
              </div>
              <div className="text-right">
                <Link className="text-sm font-semibold text-primary" href={`/app/boloes/${pool.id}`}>Abrir</Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
