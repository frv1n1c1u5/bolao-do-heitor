import { saveMatchesAction } from "@/actions/admin";
import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Button, Card, Input, Label } from "@/components/ui";
import { getDb } from "@/lib/db";
import { fetchWorldCup2026Matches } from "@/lib/football-data";
import { formatDateTime } from "@/lib/format";
import { normalizeWorldCupDateRange, WORLD_CUP_2026 } from "@/lib/world-cup";

export default async function AdminMatchesPage({
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

  const [results, savedMatches] = await Promise.all([
    fetchWorldCup2026Matches({
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      status: status || undefined,
    }).catch(() => []),
    getDb().match.findMany({
      where: { competitionCode: WORLD_CUP_2026.code },
      orderBy: { localDate: "asc" },
      take: 60,
    }),
  ]);

  return (
    <div className="space-y-4">
      <AppHeader
        title="Jogos da Copa 2026"
        subtitle="Esta tela trabalha so com a Copa do Mundo de 2026. Busque, revise e salve os jogos antes de criar os boloes."
      />
      <Card className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-primary">
              FIFA World Cup 2026
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Periodo oficial: {WORLD_CUP_2026.startDate} ate {WORLD_CUP_2026.endDate}.
              A busca abaixo ja consulta apenas a competicao WC.
            </p>
          </div>
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Encontrados na API
            </div>
            <div className="mt-1 text-2xl font-black text-foreground">{results.length}</div>
          </div>
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Salvos localmente
            </div>
            <div className="mt-1 text-2xl font-black text-foreground">{savedMatches.length}</div>
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
          </div>
        </form>
      </Card>

      {results.length ? (
        <Card>
          <form action={saveMatchesAction} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title">Resultados da busca</h2>
              <Button>Salvar selecionados</Button>
            </div>
            {results.map((match) => (
              <label key={match.externalApiId} className="flex items-start gap-3 rounded-2xl bg-background/70 p-3">
                <input type="checkbox" name="externalApiId" value={match.externalApiId} className="mt-1 h-4 w-4" />
                <div className="flex-1">
                  <div className="font-semibold">{match.homeTeam} x {match.awayTeam}</div>
                  <div className="text-sm text-muted-foreground">{match.competitionName} - {formatDateTime(match.localDate)}</div>
                </div>
                <StatusBadge status={match.status} />
              </label>
            ))}
          </form>
        </Card>
      ) : (
        <Card>
          <p className="section-copy">
            Nenhum jogo retornou para esse recorte da Copa de 2026. Ajuste o intervalo ou o status.
          </p>
        </Card>
      )}

      <Card className="space-y-3">
        <h2 className="section-title">Jogos salvos</h2>
        {savedMatches.length ? savedMatches.map((match) => (
          <div key={match.id} className="rounded-2xl bg-background/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{match.homeTeam} x {match.awayTeam}</div>
                <div className="text-sm text-muted-foreground">{match.competitionName} - {formatDateTime(match.localDate)}</div>
              </div>
              <StatusBadge status={match.status} />
            </div>
          </div>
        )) : <p className="section-copy">Ainda nao ha jogos da Copa salvos localmente.</p>}
      </Card>
    </div>
  );
}
