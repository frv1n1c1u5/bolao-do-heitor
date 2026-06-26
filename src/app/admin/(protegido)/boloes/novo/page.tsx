import Link from "next/link";
import { CalendarDays, Save, Sparkles, Target, Trophy } from "lucide-react";

import { createPoolAction, saveMatchesAction } from "@/actions/admin";
import { AppHeader } from "@/components/app-shell";
import { MatchPicker } from "@/components/match-picker";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { formatTeamName } from "@/lib/country-flags";
import { getDb } from "@/lib/db";
import { fetchWorldCup2026Matches } from "@/lib/football-data";
import { formatDateTime } from "@/lib/format";
import { getBrazilDateKey, getDefaultWorldCupDay, normalizeWorldCupDay, WORLD_CUP_2026 } from "@/lib/world-cup";

export default async function NewPoolPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const selectedDay = normalizeWorldCupDay(
    typeof params.day === "string" ? params.day : getDefaultWorldCupDay(),
  );

  const [allMatches, apiResults] = await Promise.all([
    getDb().match.findMany({
      where: { competitionCode: WORLD_CUP_2026.code },
      orderBy: { localDate: "asc" },
      take: 150,
    }),
    fetchWorldCup2026Matches({
      dateFrom: selectedDay,
      dateTo: selectedDay,
      status: status || undefined,
    }).catch(() => []),
  ]);

  const matchesForDay = allMatches.filter((match) => getBrazilDateKey(match.localDate) === selectedDay);
  const upcomingCount = matchesForDay.filter((match) => match.localDate >= new Date()).length;

  return (
    <div className="space-y-5">
      <AppHeader
        eyebrow="Fluxo guiado"
        title="Criar bolão do dia"
        subtitle="Escolha o dia da Copa, salve os jogos necessários e feche o bolão sem sair desta tela."
      />

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <Card className="hero-surface rounded-[32px] border-white/80 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="kicker mb-3">Etapa 1</div>
              <h2 className="section-title text-[1.4rem]">Buscar jogos do dia</h2>
              <p className="section-copy mt-2">Trabalhamos apenas com a Copa do Mundo 2026 e apenas com um único dia por bolão.</p>
            </div>
            <CalendarDays className="h-5 w-5 text-accent" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white/78 p-4">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Dia</div>
              <div className="mt-2 text-lg font-black text-foreground">{selectedDay}</div>
            </div>
            <div className="rounded-[24px] bg-white/78 p-4">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Jogos salvos</div>
              <div className="mt-2 text-lg font-black text-foreground">{matchesForDay.length}</div>
            </div>
            <div className="rounded-[24px] bg-white/78 p-4">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Próximos</div>
              <div className="mt-2 text-lg font-black text-foreground">{upcomingCount}</div>
            </div>
          </div>

          <form className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Dia da Copa</Label>
              <Input type="date" name="day" defaultValue={selectedDay} min={WORLD_CUP_2026.startDate} max={WORLD_CUP_2026.endDate} required />
            </div>
            <div>
              <Label>Status</Label>
              <Input name="status" defaultValue={status} placeholder="SCHEDULED, TIMED, IN_PLAY, FINISHED" />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <Button>Buscar jogos da Copa</Button>
              <Link href="/admin/boloes/novo" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/78 px-4 py-2 text-sm font-bold text-primary">
                Voltar para o padrão
              </Link>
            </div>
          </form>
        </Card>

        <Card className="rounded-[32px] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="kicker mb-3">Etapa 2</div>
              <h2 className="section-title text-[1.4rem]">Salvar jogos na base local</h2>
            </div>
            <Save className="h-5 w-5 text-secondary" />
          </div>
          {apiResults.length ? (
            <form action={saveMatchesAction} className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="section-copy">Selecione os jogos do dia que devem entrar no sistema.</p>
                <Button>Salvar</Button>
              </div>
              <div className="space-y-3">
                {apiResults.map((match) => (
                  <label key={match.externalApiId} className="flex items-start gap-3 rounded-[24px] bg-white/78 p-4">
                    <input type="checkbox" name="externalApiId" value={match.externalApiId} className="mt-1 h-4 w-4" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-base font-black text-foreground">{formatTeamName(match.homeTeam)} x {formatTeamName(match.awayTeam)}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{match.competitionName}</div>
                        </div>
                        <span className="badge bg-slate-100 text-slate-700">{match.status}</span>
                      </div>
                      <div className="mt-3 text-sm font-medium text-muted-foreground">{formatDateTime(match.localDate)}</div>
                    </div>
                  </label>
                ))}
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-slate-300/60 bg-slate-50 p-4 text-sm text-muted-foreground">
              Nenhum jogo retornou para esse dia da Copa de 2026. Ajuste a data ou o status.
            </div>
          )}
        </Card>
      </div>

      <Card className="rounded-[32px] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="kicker mb-3">Etapa 3</div>
            <h2 className="section-title text-[1.45rem]">Montar o bolão</h2>
            <p className="section-copy mt-2">Defina tipo, valor, premiação e escolha apenas os jogos salvos deste dia.</p>
          </div>
          <Trophy className="h-5 w-5 text-accent" />
        </div>

        <form action={createPoolAction} className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Label>Nome do bolão</Label>
            <Input name="name" required placeholder="Ex.: Rodada 3 da Copa" />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select name="type" defaultValue="DAY">
              <option value="GAME">Bolão por jogo</option>
              <option value="DAY">Bolão do dia</option>
            </Select>
          </div>
          <div>
            <Label>Data do bolão</Label>
            <Input type="date" name="poolDate" defaultValue={selectedDay} min={WORLD_CUP_2026.startDate} max={WORLD_CUP_2026.endDate} required />
          </div>
          <div>
            <Label>Valor da participação</Label>
            <Input name="entryFee" type="number" step="0.01" inputMode="decimal" defaultValue="10" required />
          </div>
          <div>
            <Label>Modo de premiação</Label>
            <Select name="prizeMode" defaultValue="ONE">
              <option value="ONE">Apenas 1 vencedor</option>
              <option value="TOP2">Top 2</option>
              <option value="TOP3">Top 3</option>
            </Select>
          </div>
          <div>
            <Label>Percentual da casa</Label>
            <Input name="houseFeePercentage" type="number" step="0.01" defaultValue="30" />
          </div>
          <div>
            <Label>Percentual do prêmio</Label>
            <Input name="prizePercentage" type="number" step="0.01" defaultValue="70" />
          </div>
          <div>
            <Label>1º lugar (%)</Label>
            <Input name="firstPlacePercentage" type="number" step="0.01" defaultValue="100" />
          </div>
          <div>
            <Label>2º lugar (%)</Label>
            <Input name="secondPlacePercentage" type="number" step="0.01" defaultValue="0" />
          </div>
          <div>
            <Label>3º lugar (%)</Label>
            <Input name="thirdPlacePercentage" type="number" step="0.01" defaultValue="0" />
          </div>
          <div>
            <Label>Limite geral de palpites</Label>
            <Input type="datetime-local" name="cutoffDateTime" />
          </div>
          <div className="lg:col-span-2">
            <Label>Observações / regras</Label>
            <Textarea name="notes" placeholder="Regras rápidas do bolão da Copa..." />
          </div>
          <div className="lg:col-span-2 rounded-[28px] bg-slate-50 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="kicker mb-2">Seleção final</div>
                <Label>Jogos vinculados</Label>
              </div>
              <Link href="/admin/jogos" className="text-sm font-bold text-primary">
                Ver tela completa
              </Link>
            </div>
            {matchesForDay.length ? (
              <MatchPicker
                inputName="matchIds"
                matches={matchesForDay.map((match) => ({
                  id: match.id,
                  homeTeam: match.homeTeam,
                  awayTeam: match.awayTeam,
                  competitionName: match.competitionName,
                  localDateLabel: formatDateTime(match.localDate),
                  status: match.status,
                  startsAt: match.localDate.toISOString(),
                }))}
              />
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300/60 bg-white p-4 text-sm text-muted-foreground">
                Nenhum jogo salvo ainda para esse dia. Use a busca acima e salve os jogos antes de criar o bolão.
              </div>
            )}
          </div>
          <div className="lg:col-span-2 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 text-secondary" />
              Um bolão, um dia, jogos selecionados pelo admin.
            </div>
            <Button>Criar bolão</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
