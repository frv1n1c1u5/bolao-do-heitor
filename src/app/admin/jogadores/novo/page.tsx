import { createPlayerAction } from "@/actions/admin";
import { AppHeader } from "@/components/app-shell";
import { Button, Card, Input, Label, Select } from "@/components/ui";

export default function NewPlayerPage() {
  return (
    <div className="space-y-4">
      <AppHeader title="Novo jogador" subtitle="Somente o admin cadastra jogadores. O PIN - salvo com hash." />
      <Card className="max-w-2xl">
        <form action={createPlayerAction} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome</Label>
            <Input name="name" required />
          </div>
          <div>
            <Label>Apelido</Label>
            <Input name="nickname" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input name="phone" inputMode="tel" required />
          </div>
          <div>
            <Label>PIN de 4 digitos</Label>
            <Input name="pin" inputMode="numeric" maxLength={4} required />
          </div>
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue="ACTIVE">
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button>Criar jogador</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
