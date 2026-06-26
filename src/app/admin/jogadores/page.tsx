import Link from "next/link";
import { PaymentStatus, PoolStatus, UserRole } from "@prisma/client";

import { resetPlayerPinAction, updatePlayerStatusAction } from "@/actions/admin";
import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Button, Card, Input } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatCurrency, formatPhone } from "@/lib/format";
import { requireUser } from "@/lib/auth";

export default async function AdminPlayersPage() {
  await requireUser(UserRole.ADMIN);
  const db = getDb();
  const players = await db.user.findMany({
    where: { role: UserRole.PLAYER },
    include: {
      entries: {
        where: { paymentStatus: PaymentStatus.CONFIRMED },
        include: { pool: true },
      },
      rankings: {
        where: { pool: { status: PoolStatus.FINISHED } },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <AppHeader title="Jogadores" subtitle="Cadastro manual, status, reset de PIN e visao rapida do historico." actions={<Link className="badge bg-primary text-primary-foreground" href="/admin/jogadores/novo">Novo jogador</Link>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {players.map((player) => {
          const winnings = player.rankings.reduce((sum, ranking) => sum + Number(ranking.prizeAmount), 0);
          const wins = player.rankings.filter((ranking) => ranking.position === 1).length;
          return (
            <Card key={player.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-bold">{player.nickname || player.name}</div>
                  <div className="text-sm text-muted-foreground">{player.name} - {formatPhone(player.phone)}</div>
                </div>
                <StatusBadge status={player.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-xl bg-background/70 p-3"><div className="text-muted-foreground">Participacoes</div><div className="mt-1 font-bold">{player.entries.length}</div></div>
                <div className="rounded-xl bg-background/70 p-3"><div className="text-muted-foreground">Vitorias</div><div className="mt-1 font-bold">{wins}</div></div>
                <div className="rounded-xl bg-background/70 p-3"><div className="text-muted-foreground">Premios</div><div className="mt-1 font-bold">{formatCurrency(winnings)}</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={updatePlayerStatusAction}>
                  <input type="hidden" name="userId" value={player.id} />
                  <input type="hidden" name="status" value={player.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"} />
                  <Button variant="secondary">{player.status === "ACTIVE" ? "Inativar" : "Ativar"}</Button>
                </form>
                <form action={resetPlayerPinAction} className="flex gap-2">
                  <input type="hidden" name="userId" value={player.id} />
                  <Input name="pin" placeholder="Novo PIN" inputMode="numeric" maxLength={4} className="w-28" />
                  <Button>Resetar PIN</Button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
