import { saveMatchesAction } from "@/actions/admin";
import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Button, Card, Input, Label } from "@/components/ui";
import { getDb } from "@/lib/db";
import { fetchMatches } from "@/lib/football-data";
import { formatDateTime } from "@/lib/format";

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const dateFrom = typeof params.dateFrom === "string" ? params.dateFrom : "";
  const dateTo = typeof params.dateTo === "string" ? params.dateTo : "";
  const competition = typeof params.competition === "string" ? params.competition : "";
  const status = typeof params.status === "string" ? params.status : "";

  const [results, savedMatches] = await Promise.all([
    dateFrom ? fetchMatches({ dateFrom, dateTo: dateTo || dateFrom, competition: competition || undefined, status: status || undefined }).catch(() => []) : Promise.resolve([]),
    getDb().match.findMany({ orderBy: { localDate: "desc" }, take: 12 }),
  ]);

  return (
    <div className="space-y-4">
      <AppHeader title="Jogos" subtitle="Busque jogos na football-data.org e salve localmente antes de criar boloes." />
      <Card>
        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Data inicial</Label>
            <Input type="date" name="dateFrom" defaultValue={dateFrom} required />
          </div>
          <div>
            <Label>Data final</Label>
            <Input type="date" name="dateTo" defaultValue={dateTo} />
          </div>
          <div>
            <Label>Competicao</Label>
            <Input name="competition" defaultValue={competition} placeholder="Ex.: BSA, PL" />
          </div>
          <div>
            <Label>Status</Label>
            <Input name="status" defaultValue={status} placeholder="SCHEDULED, FINISHED..." />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button>Buscar jogos</Button>
          </div>
        </form>
      </Card>

      {results.length ? (
        <Card>
          <form action={saveMatchesAction} className="space-y-3">
            <h2 className="section-title">Resultados da busca</h2>
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
            <Button>Salvar selecionados</Button>
          </form>
        </Card>
      ) : null}

      <Card className="space-y-3">
        <h2 className="section-title">Jogos salvos</h2>
        {savedMatches.map((match) => (
          <div key={match.id} className="rounded-2xl bg-background/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{match.homeTeam} x {match.awayTeam}</div>
                <div className="text-sm text-muted-foreground">{match.competitionName} - {formatDateTime(match.localDate)}</div>
              </div>
              <StatusBadge status={match.status} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
