"use client";

import { Copy, QrCode, Wallet } from "lucide-react";
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
    <Card className="hero-surface space-y-4 overflow-hidden rounded-[30px] border-white/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="kicker mb-3">
            <Wallet className="h-3.5 w-3.5" />
            Pagamento Pix
          </div>
          <h3 className="section-title">Confirme sua participação</h3>
          <p className="section-copy mt-2">Valor da participação: <span className="font-bold text-foreground">{fee}</span></p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white/82 text-primary shadow-[0_12px_24px_rgba(10,24,56,0.08)]">
          <QrCode className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[220px_1fr] xl:items-center">
        {pixCopyPaste ? (
          <div className="mx-auto flex w-full max-w-[220px] justify-center rounded-[28px] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
            <QRCodeSVG value={pixCopyPaste} size={180} includeMargin />
          </div>
        ) : null}

        <div className="space-y-3">
          {pixKey ? (
            <div className="rounded-[24px] bg-white/78 p-4">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Chave Pix</div>
              <div className="mt-2 break-all text-sm font-semibold text-foreground">{pixKey}</div>
            </div>
          ) : null}

          {pixCopyPaste ? (
            <div className="rounded-[24px] bg-white/78 p-4">
              <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Pix copia e cola</div>
              <div className="mt-2 break-all text-sm leading-6 text-muted-foreground">{pixCopyPaste}</div>
            </div>
          ) : null}

          {copyText ? (
            <Button type="button" variant="secondary" className="w-full xl:w-auto" onClick={() => navigator.clipboard.writeText(copyText)}>
              <Copy className="h-4 w-4" />
              Copiar Pix
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground/86">
        {instructions || "Após pagar, clique em Já paguei e aguarde a confirmação manual do admin."}
      </div>
    </Card>
  );
}
