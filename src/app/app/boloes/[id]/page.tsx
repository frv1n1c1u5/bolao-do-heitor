import { UserRole } from "@prisma/client";
import Link from "next/link";

import { joinPoolAction, markPaidAction, savePredictionsAction } from "@/actions/player";
import { AppHeader, StatusBadge } from "@/components/app-shell";
import { MatchCard } from "@/components/match-card";
import { PixPanel } from "@/components/pix-panel";
import { Button, Card, Input } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { ensureDefaultSettings, isPredictionLocked } from "@/lib/pools";

export default async function PlayerPoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser(UserRole.PLAYER);
  const { id } = await params;
  const [pool, settings] = await Promise.all([
    getDb().pool.findUniqueOrThrow({
      where: { id },
      include: {
        poolMatches: { include: { match: true } },
        entries: {
          include: {
            user: true,
            predictions: true,
          },
        },
      },
    }),
    ensureDefaultSettings(),
  ]);

  const myEntry = pool.entries.find((entry) => entry.userId === session.user.id);
  const now = new Date();

  return (
    <div className="space-y-4">
      <AppHeader title={pool.name} subtitle={`${pool.type} - ${formatCurrency(Number(pool.entryFee))}`} actions={<StatusBadge status={pool.status} />} />

      {!myEntry ? (
        <Card className="space-y-3">
          <p className="section-copy">Entre no bolao para liberar pagamento e palpites.</p>
          <form action={joinPoolAction}><input type="hidden" name="poolId" value={pool.id} /><Button>Entrar no bolao</Button></form>
        </Card>
      ) : null}

      {myEntry ? (
        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <PixPanel
              fee={formatCurrency(Number(pool.entryFee))}
              pixKey={settings.pixKey}
              pixCopyPaste={settings.pixCopyPaste}
              instructions={settings.paymentInstructions}
            />
            <Card className="space-y-3">
              <h2 className="section-title">Seu status</h2>
              <StatusBadge status={myEntry.paymentStatus} />
              <p className="section-copy">Apos pagar, clique em Ja paguei e aguarde a confirma--o manual do admin.</p>
              <form action={markPaidAction}><input type="hidden" name="poolId" value={pool.id} /><Button variant="secondary">Ja paguei</Button></form>
              <Link className="text-sm font-semibold text-primary" href={`/app/ranking/${pool.id}`}>Ver ranking</Link>
            </Card>
          </div>

          <Card className="space-y-4">
            <div>
              <h2 className="section-title">Palpites</h2>
              <p className="section-copy mt-1">Voce ainda pode alterar ate o jogo comecar. Palpites dos outros liberados apos o inicio do jogo.</p>
            </div>
            <form action={savePredictionsAction} className="space-y-4">
              <input type="hidden" name="poolId" value={pool.id} />
              {pool.poolMatches.map((poolMatch) => {
                const prediction = myEntry.predictions.find((item) => item.matchId === poolMatch.matchId);
                const locked = isPredictionLocked(poolMatch.match.localDate, pool.cutoffDateTime);
                const started = new Date(poolMatch.match.localDate).getTime() <= now.getTime();
                return (
                  <div key={poolMatch.id} className="rounded-2xl bg-background/70 p-3">
                    <MatchCard match={poolMatch.match} rightSlot={<StatusBadge status={locked ? "CLOSED" : "OPEN"} />} />
                    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold">Mandante</label>
                        <Input name={`home_${poolMatch.matchId}`} type="number" inputMode="numeric" min="0" defaultValue={prediction?.predictedHomeScore ?? ""} disabled={locked} />
                      </div>
                      <div className="pb-3 text-sm font-black">x</div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold">Visitante</label>
                        <Input name={`away_${poolMatch.matchId}`} type="number" inputMode="numeric" min="0" defaultValue={prediction?.predictedAwayScore ?? ""} disabled={locked} />
                      </div>
                    </div>
                    {started ? (
                      <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm dark:bg-slate-950/30">
                        <div className="mb-2 font-semibold">Palpites liberados</div>
                        <div className="space-y-2">
                          {pool.entries.map((entry) => {
                            const publicPrediction = entry.predictions.find((item) => item.matchId === poolMatch.matchId);
                            return (
                              <div key={entry.id} className="flex items-center justify-between">
                                <span>{entry.user.nickname || entry.user.name}</span>
                                <span className="font-semibold">{publicPrediction ? `${publicPrediction.predictedHomeScore} x ${publicPrediction.predictedAwayScore}` : "Sem palpite"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <Button>Salvar palpites</Button>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
