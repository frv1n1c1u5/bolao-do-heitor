import Link from "next/link";

import { createPoolAction, saveMatchesAction } from "@/actions/admin";
import { AppHeader } from "@/components/app-shell";
import { MatchPicker } from "@/components/match-picker";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { getDb } from "@/lib/db";
import { fetchWorldCup2026Matches } from "@/lib/football-data";
import { formatDateTime } from "@/lib/format";
import { normalizeWorldCupDateRange, WORLD_CUP_2026 } from "@/lib/world-cup";

export default async function NewPoolPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const range = normalizeWorldCupDateRange(
    typeof params.dateFrom === "string" ? params.dateFrom : WORLD_CUP_2026.startDate,
    typeof params.dateTo === "string" ? params.dateTo : WORLD_CUP_2026.endDate,
  );

  const [matches, apiResults] = await Promise.all([
    getDb().match.findMany({
      where: { competitionCode: WORLD_CUP_2026.code },
      orderBy: { localDate: "asc" },
      take: 150,
    }),
    fetchWorldCup2026Matches({
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      status: status || undefined,
    }).catch(() => []),
  ]);

  const upcomingCount = matches.filter((match) => match.localDate >= new Date()).length;

  return (
    <div className="space-y-4">
      <AppHeader
        title="Novo bolao da Copa 2026"
        subtitle="Busque jogos da Copa aqui mesmo, salve os selecionados e monte o bolao sem sair da tela."
      />

      <Card className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-primary">
              Copa do Mundo 2026
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A busca abaixo ja esta presa na competicao WC, com periodo oficial de {WORLD_CUP_2026.startDate} ate {WORLD_CUP_2026.endDate}.
            </p>
          </div>
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Jogos salvos
            </div>
            <div className="mt-1 text-2xl font-black text-foreground">{matches.length}</div>
          </div>
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Proximos jogos
            </div>
            <div className="mt-1 text-2xl font-black text-foreground">{upcomingCount}</div>
          </div>
        </div>

        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Data inicial</Label>
            <Input type="date" name="dateFrom" defaultValue={range.dateFrom} required />
          </div>
          <div>
            <Label>Data final</Label>
            <Input type="date" name="dateTo" defaultValue={range.dateTo} required />
          </div>
          <div>
            <Label>Status</Label>
            <Input name="status" defaultValue={status} placeholder="SCHEDULED, TIMED, IN_PLAY, FINISHED" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2">
            <Button>Buscar jogos da Copa</Button>
            <Link href="/admin/boloes/novo" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300/40 px-4 py-2 text-sm font-semibold text-foreground transition hover:opacity-95">
              Voltar ao periodo oficial
            </Link>
          </div>
        </form>

        {apiResults.length ? (
          <form action={saveMatchesAction} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-title">Resultados da API</h2>
                <p className="section-copy mt-1">
                  Selecione os jogos da Copa que devem entrar na base local antes de criar o bolao.
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
                          {match.homeTeam} x {match.awayTeam}
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
            Nenhum jogo retornou para esse recorte da Copa de 2026. Ajuste o intervalo ou o status.
          </div>
        )}
      </Card>

      <Card>
        <form action={createPoolAction} className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Label>Nome do bolao</Label>
            <Input name="name" required placeholder="Ex.: Rodada 3 da Copa" />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select name="type" defaultValue="DAY">
              <option value="GAME">Bolao por jogo</option>
              <option value="DAY">Bolao do dia</option>
            </Select>
          </div>
          <div>
            <Label>Data do bolao</Label>
            <Input type="date" name="poolDate" defaultValue={range.dateFrom} required />
          </div>
          <div>
            <Label>Valor da participacao</Label>
            <Input name="entryFee" type="number" step="0.01" inputMode="decimal" defaultValue="10" required />
          </div>
          <div>
            <Label>Modo de premiacao</Label>
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
            <Label>Percentual do premio</Label>
            <Input name="prizePercentage" type="number" step="0.01" defaultValue="70" />
          </div>
          <div>
            <Label>1o lugar (%)</Label>
            <Input name="firstPlacePercentage" type="number" step="0.01" defaultValue="100" />
          </div>
          <div>
            <Label>2o lugar (%)</Label>
            <Input name="secondPlacePercentage" type="number" step="0.01" defaultValue="0" />
          </div>
          <div>
            <Label>3o lugar (%)</Label>
            <Input name="thirdPlacePercentage" type="number" step="0.01" defaultValue="0" />
          </div>
          <div>
            <Label>Limite geral de palpites</Label>
            <Input type="datetime-local" name="cutoffDateTime" />
          </div>
          <div className="lg:col-span-2">
            <Label>Observacoes / regras</Label>
            <Textarea name="notes" placeholder="Regras rapidas do bolao da Copa..." />
          </div>
          <div className="lg:col-span-2">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <Label>Jogos vinculados</Label>
              <Link href="/admin/jogos" className="text-sm font-semibold text-primary">
                Ver tela completa de jogos da Copa
              </Link>
            </div>
            {matches.length ? (
              <MatchPicker
                inputName="matchIds"
                matches={matches.map((match) => ({
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
                Nenhum jogo da Copa salvo ainda. Use a busca acima e salve os jogos antes de criar o bolao.
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <Button>Criar bolao</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
