import { saveMatchesAction } from "@/actions/admin";
import { AppHeader, StatusBadge } from "@/components/app-shell";
import { Button, Card, Input, Label } from "@/components/ui";
import { formatTeamName } from "@/lib/country-flags";
import { getDb } from "@/lib/db";
import { fetchWorldCup2026Matches } from "@/lib/football-data";
import { formatDateTime } from "@/lib/format";
import { getBrazilDateKey, getDefaultWorldCupDay, normalizeWorldCupDay, WORLD_CUP_2026 } from "@/lib/world-cup";

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const selectedDay = normalizeWorldCupDay(
    typeof params.day === "string" ? params.day : getDefaultWorldCupDay(),
  );

  const [results, allSavedMatches] = await Promise.all([
    fetchWorldCup2026Matches({
      dateFrom: selectedDay,
      dateTo: selectedDay,
      status: status || undefined,
    }).catch(() => []),
    getDb().match.findMany({
      where: { competitionCode: WORLD_CUP_2026.code },
      orderBy: { localDate: "asc" },
      take: 150,
    }),
  ]);

  const savedMatches = allSavedMatches.filter((match) => getBrazilDateKey(match.localDate) === selectedDay);

  return (
    <div className="space-y-4">
      <AppHeader
        title="Jogos da Copa 2026"
        subtitle="Escolha um único dia da Copa, revise os jogos da data e salve localmente antes de criar o bolão."
      />
      <Card className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="rounded-2xl bg-background/75 p-4">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-primary">
              FIFA World Cup 2026
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Período oficial: {WORLD_CUP_2026.startDate} até {WORLD_CUP_2026.endDate}. A busca abaixo já consulta apenas a competição WC.
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
            <Label>Dia da Copa</Label>
            <Input type="date" name="day" defaultValue={selectedDay} min={WORLD_CUP_2026.startDate} max={WORLD_CUP_2026.endDate} required />
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
                  <div className="font-semibold">{formatTeamName(match.homeTeam)} x {formatTeamName(match.awayTeam)}</div>
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
            Nenhum jogo retornou para esse dia da Copa de 2026. Ajuste a data ou o status.
          </p>
        </Card>
      )}

      <Card className="space-y-3">
        <h2 className="section-title">Jogos salvos</h2>
        {savedMatches.length ? savedMatches.map((match) => (
          <div key={match.id} className="rounded-2xl bg-background/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{formatTeamName(match.homeTeam)} x {formatTeamName(match.awayTeam)}</div>
                <div className="text-sm text-muted-foreground">{match.competitionName} - {formatDateTime(match.localDate)}</div>
              </div>
              <StatusBadge status={match.status} />
            </div>
          </div>
        )) : <p className="section-copy">Ainda não há jogos da Copa salvos localmente para este dia.</p>}
      </Card>
    </div>
  );
}
