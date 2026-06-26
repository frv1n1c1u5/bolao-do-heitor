import Link from "next/link";

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
    <div className="space-y-4">
      <AppHeader
        title="Novo bolão da Copa 2026"
        subtitle="Escolha um único dia da Copa, salve os jogos desejados e monte o bolão sem sair da tela."
      />

      <Card className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-primary">
              Copa do Mundo 2026
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Cada bolão usa apenas um dia da Copa. A busca abaixo já está presa na competição WC, dentro do período oficial de {WORLD_CUP_2026.startDate} até {WORLD_CUP_2026.endDate}.
            </p>
          </div>
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Jogos salvos
            </div>
            <div className="mt-1 text-2xl font-black text-foreground">{matchesForDay.length}</div>
          </div>
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Próximos jogos
            </div>
            <div className="mt-1 text-2xl font-black text-foreground">{upcomingCount}</div>
          </div>
        </div>

        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Dia da Copa</Label>
            <Input type="date" name="day" defaultValue={selectedDay} min={WORLD_CUP_2026.startDate} max={WORLD_CUP_2026.endDate} required />
          </div>
          <div>
            <Label>Status</Label>
            <Input name="status" defaultValue={status} placeholder="SCHEDULED, TIMED, IN_PLAY, FINISHED" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2">
            <Button>Buscar jogos da Copa</Button>
            <Link href="/admin/boloes/novo" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300/40 px-4 py-2 text-sm font-semibold text-foreground transition hover:opacity-95">
              Voltar para o dia padrão
            </Link>
          </div>
        </form>

        {apiResults.length ? (
          <form action={saveMatchesAction} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-title">Resultados da API</h2>
                <p className="section-copy mt-1">
                  Selecione os jogos desse dia da Copa que devem entrar na base local antes de criar o bolão.
                </p>
              </div>
              <Button>Salvar selecionados</Button>
            </div>
            <div className="space-y-3">
              {apiResults.map((match) => (
                <label
                  key={match.externalApiId}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/85 p-3 dark:border-slate-800 dark:bg-slate-950/30"
                >
                  <input
                    type="checkbox"
                    name="externalApiId"
                    value={match.externalApiId}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-base font-bold text-foreground">
                          {formatTeamName(match.homeTeam)} x {formatTeamName(match.awayTeam)}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {match.competitionName}
                        </div>
                      </div>
                      <span className="badge bg-secondary text-secondary-foreground">
                        {match.status}
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-medium text-muted-foreground">
                      {formatDateTime(match.localDate)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300/60 bg-background/70 p-4 text-sm text-muted-foreground">
            Nenhum jogo retornou para esse dia da Copa de 2026. Ajuste a data ou o status.
          </div>
        )}
      </Card>

      <Card>
        <form action={createPoolAction} className="grid gap-4 lg:grid-cols-2">
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
          <div className="lg:col-span-2">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <Label>Jogos vinculados</Label>
              <Link href="/admin/jogos" className="text-sm font-semibold text-primary">
                Ver tela completa de jogos da Copa
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
              <div className="rounded-2xl border border-dashed border-slate-300/60 bg-background/70 p-4 text-sm text-muted-foreground">
                Nenhum jogo da Copa salvo ainda para esse dia. Use a busca acima e salve os jogos antes de criar o bolão.
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <Button>Criar bolão</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
