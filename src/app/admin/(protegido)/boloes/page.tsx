import Link from "next/link";

import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminPoolsPage() {
  const pools = await getDb().pool.findMany({
    include: { entries: true, poolMatches: true, rankings: true },
    orderBy: { poolDate: "desc" },
  });

  return (
    <div className="space-y-4">
      <AppHeader title="Bolões" subtitle="Crie bolões por jogo ou por dia e acompanhe pagamentos e apuração." actions={<Link className="badge bg-primary text-primary-foreground" href="/admin/boloes/novo">Novo bolão</Link>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {pools.map((pool) => (
          <Card key={pool.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold">{pool.name}</div>
                <div className="text-sm text-muted-foreground">{pool.type} - {formatDate(pool.poolDate)} - {pool.poolMatches.length} jogo(s)</div>
              </div>
              <StatusBadge status={pool.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl bg-background/70 p-3"><div className="text-muted-foreground">Valor</div><div className="mt-1 font-bold">{formatCurrency(Number(pool.entryFee))}</div></div>
              <div className="rounded-xl bg-background/70 p-3"><div className="text-muted-foreground">Entradas</div><div className="mt-1 font-bold">{pool.entries.length}</div></div>
              <div className="rounded-xl bg-background/70 p-3"><div className="text-muted-foreground">Ranking</div><div className="mt-1 font-bold">{pool.rankings.length}</div></div>
            </div>
            <div className="text-right">
              <Link className="text-sm font-semibold text-primary" href={`/admin/boloes/${pool.id}`}>Abrir detalhes</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

