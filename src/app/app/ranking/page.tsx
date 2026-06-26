import Link from "next/link";
import { UserRole } from "@prisma/client";

import { AppHeader } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function RankingIndexPage() {
  const session = await requireUser(UserRole.PLAYER);
  const entries = await getDb().poolEntry.findMany({
    where: { userId: session.user.id },
    include: { pool: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <AppHeader title="Rankings" subtitle="Acesse os rankings dos boloes em que voce entrou." />
      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{entry.pool.name}</div>
              <div className="text-sm text-muted-foreground">{entry.pool.status}</div>
            </div>
            <Link className="text-sm font-semibold text-primary" href={`/app/ranking/${entry.poolId}`}>Abrir</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
