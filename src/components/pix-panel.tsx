"use client";

import { QRCodeSVG } from "qrcode.react";

import { Card, Button } from "@/components/ui";

export function PixPanel({
  fee,
  pixKey,
  pixCopyPaste,
  instructions,
}: {
  fee: string;
  pixKey?: string | null;
  pixCopyPaste?: string | null;
  instructions?: string | null;
}) {
  const copyText = pixCopyPaste || pixKey || "";

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="section-title">Pagamento via Pix</h3>
        <p className="section-copy mt-1">Valor da participacao: {fee}</p>
      </div>
      {pixCopyPaste ? (
        <div className="flex justify-center rounded-2xl bg-white p-4">
          <QRCodeSVG value={pixCopyPaste} size={180} includeMargin />
        </div>
      ) : null}
      {pixKey ? (
        <div className="rounded-2xl bg-background/70 p-3 text-sm">
          <div className="font-semibold">Chave Pix</div>
          <div className="mt-1 break-all text-muted-foreground">{pixKey}</div>
        </div>
      ) : null}
      {pixCopyPaste ? (
        <div className="rounded-2xl bg-background/70 p-3 text-sm">
          <div className="font-semibold">Pix Copia e Cola</div>
          <div className="mt-1 break-all text-muted-foreground">{pixCopyPaste}</div>
        </div>
      ) : null}
      {copyText ? (
        <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(copyText)}>
          Copiar Pix
        </Button>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {instructions || "Apos pagar, clique em Ja paguei e aguarde a confirma--o manual do admin."}
      </p>
    </Card>
  );
}
