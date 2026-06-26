import { createPoolAction } from "@/actions/admin";
import { AppHeader } from "@/components/app-shell";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function NewPoolPage() {
  const matches = await getDb().match.findMany({ orderBy: { localDate: "asc" }, take: 30 });

  return (
    <div className="space-y-4">
      <AppHeader title="Novo bolao" subtitle="Bolao por jogo ou bolao do dia, sempre baseado nos jogos salvos localmente." />
      <Card>
        <form action={createPoolAction} className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Label>Nome do bolao</Label>
            <Input name="name" required placeholder="Ex.: Rodada de sobado" />
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
            <Input type="date" name="poolDate" required />
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
            <Textarea name="notes" placeholder="Regras rapidas do bolao..." />
          </div>
          <div className="lg:col-span-2">
            <Label>Jogos vinculados</Label>
            <div className="space-y-3 rounded-2xl bg-background/70 p-3">
              {matches.map((match) => (
                <label key={match.id} className="flex items-start gap-3 rounded-xl bg-white/80 p-3 dark:bg-slate-950/20">
                  <input type="checkbox" name="matchIds" value={match.id} className="mt-1 h-4 w-4" />
                  <div>
                    <div className="font-semibold">{match.homeTeam} x {match.awayTeam}</div>
                    <div className="text-sm text-muted-foreground">{match.competitionName} - {formatDateTime(match.localDate)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <Button>Criar bolao</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
