import { saveAdminSettingsAction } from "@/actions/admin";
import { AppHeader } from "@/components/app-shell";
import { PixPanel } from "@/components/pix-panel";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { ensureDefaultSettings } from "@/lib/pools";

export default async function AdminSettingsPage() {
  const settings = await ensureDefaultSettings();

  return (
    <div className="space-y-4">
      <AppHeader title="Configuracoes" subtitle="Dados do Pix, instrucoes de pagamento e percentual padrao da casa." />
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <form action={saveAdminSettingsAction} className="grid gap-4">
            <div>
              <Label>Nome do recebedor Pix</Label>
              <Input name="pixReceiverName" defaultValue={settings.pixReceiverName ?? ""} />
            </div>
            <div>
              <Label>Chave Pix</Label>
              <Input name="pixKey" defaultValue={settings.pixKey ?? ""} />
            </div>
            <div>
              <Label>Cidade do recebedor</Label>
              <Input name="pixCity" defaultValue={settings.pixCity ?? ""} />
            </div>
            <div>
              <Label>Pix Copia e Cola</Label>
              <Textarea name="pixCopyPaste" defaultValue={settings.pixCopyPaste ?? ""} />
            </div>
            <div>
              <Label>Instrucoes de pagamento</Label>
              <Textarea name="paymentInstructions" defaultValue={settings.paymentInstructions ?? ""} />
            </div>
            <div>
              <Label>Percentual da casa</Label>
              <Input name="houseFeePercentage" type="number" step="0.01" defaultValue={Number(settings.houseFeePercentage)} />
            </div>
            <Button>Salvar configuracoes</Button>
          </form>
        </Card>
        <PixPanel
          fee={formatCurrency(10)}
          pixKey={settings.pixKey}
          pixCopyPaste={settings.pixCopyPaste}
          instructions={settings.paymentInstructions}
        />
      </div>
    </div>
  );
}

