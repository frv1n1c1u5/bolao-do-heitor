import { UserRole } from "@prisma/client";
import Link from "next/link";
import { Eye, Lock, Sparkles } from "lucide-react";

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
  const session = await requireUser([UserRole.PLAYER, UserRole.ADMIN]);
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
    <div className="space-y-5">
      <AppHeader
        eyebrow="Bolão do dia"
        title={pool.name}
        subtitle={`${pool.type} • ${pool.poolMatches.length} jogo(s) • ${formatCurrency(Number(pool.entryFee))}`}
        actions={<StatusBadge status={pool.status} />}
      />

      {!myEntry ? (
        <Card className="hero-surface rounded-[32px] border-white/80 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="kicker mb-3">Entrada no bolão</div>
              <h2 className="section-title text-[1.45rem]">Você ainda não entrou</h2>
              <p className="section-copy mt-2 max-w-lg">Entre para liberar pagamento, palpites e participação oficial no ranking.</p>
            </div>
            <form action={joinPoolAction}>
              <input type="hidden" name="poolId" value={pool.id} />
              <Button className="min-w-44">Entrar no bolão</Button>
            </form>
          </div>
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

            <Card className="rounded-[30px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="kicker mb-3">Seu status</div>
                  <h2 className="section-title text-[1.35rem]">Pagamento e acesso</h2>
                </div>
                <StatusBadge status={myEntry.paymentStatus} />
              </div>
              <p className="section-copy mt-3">Após pagar, clique em Já paguei e aguarde a confirmação manual do admin.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <form action={markPaidAction}>
                  <input type="hidden" name="poolId" value={pool.id} />
                  <Button variant="secondary">Já paguei</Button>
                </form>
                <Link className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/78 px-4 py-2 text-sm font-bold text-primary" href={`/app/ranking/${pool.id}`}>
                  Ver ranking
                </Link>
              </div>
            </Card>
          </div>

          <Card className="rounded-[32px] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="kicker mb-3">Seus palpites</div>
                <h2 className="section-title text-[1.45rem]">Palpite jogo a jogo</h2>
                <p className="section-copy mt-2">Você ainda pode alterar até o jogo começar. Depois disso, os palpites dos outros são liberados.</p>
              </div>
              <Sparkles className="h-5 w-5 text-accent" />
            </div>

            <form action={savePredictionsAction} className="mt-5 space-y-4">
              <input type="hidden" name="poolId" value={pool.id} />
              {pool.poolMatches.map((poolMatch) => {
                const prediction = myEntry.predictions.find((item) => item.matchId === poolMatch.matchId);
                const locked = isPredictionLocked(poolMatch.match.localDate, pool.cutoffDateTime);
                const started = new Date(poolMatch.match.localDate).getTime() <= now.getTime();
                return (
                  <div key={poolMatch.id} className="rounded-[28px] bg-white/78 p-4">
                    <MatchCard match={poolMatch.match} rightSlot={<StatusBadge status={locked ? "CLOSED" : "OPEN"} />} />
                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Mandante</label>
                        <Input name={`home_${poolMatch.matchId}`} type="number" inputMode="numeric" min="0" defaultValue={prediction?.predictedHomeScore ?? ""} disabled={locked} className="score-box" />
                      </div>
                      <div className="pb-3 text-xl font-black text-muted-foreground">x</div>
                      <div>
                        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Visitante</label>
                        <Input name={`away_${poolMatch.matchId}`} type="number" inputMode="numeric" min="0" defaultValue={prediction?.predictedAwayScore ?? ""} disabled={locked} className="score-box" />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      {started ? <Eye className="h-4 w-4 text-secondary" /> : <Lock className="h-4 w-4 text-primary" />}
                      {started ? "Palpites dos outros já estão visíveis." : "Palpites alheios bloqueados até o apito inicial."}
                    </div>

                    {started ? (
                      <div className="mt-4 rounded-[24px] bg-slate-50 p-4 text-sm">
                        <div className="mb-3 font-bold text-foreground">Palpites liberados</div>
                        <div className="space-y-2">
                          {pool.entries.map((entry) => {
                            const publicPrediction = entry.predictions.find((item) => item.matchId === poolMatch.matchId);
                            return (
                              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2">
                                <span className="truncate font-medium text-foreground">{entry.user.nickname || entry.user.name}</span>
                                <span className="font-bold text-primary">{publicPrediction ? `${publicPrediction.predictedHomeScore} x ${publicPrediction.predictedAwayScore}` : "Sem palpite"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
              <Button className="w-full">Salvar palpites</Button>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
