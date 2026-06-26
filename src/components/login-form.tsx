"use client";

import { KeyRound, Loader2, Phone, ShieldCheck } from "lucide-react";
import { useActionState } from "react";

import { Button, Card, Input, Label } from "@/components/ui";

export function LoginForm({
  action,
  title,
  subtitle,
  helper,
}: {
  action: (state: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;
  title: string;
  subtitle: string;
  helper?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="mx-auto w-full max-w-md rounded-[32px] border-white/70 bg-white/92 p-5 shadow-[0_28px_80px_rgba(10,24,56,0.14)] sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[22px] bg-primary text-primary-foreground shadow-[0_14px_26px_rgba(13,27,54,0.18)]">
          <ShieldCheck className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <div className="kicker mb-2">Acesso rápido</div>
          <h1 className="text-[1.9rem] font-black tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <Label>Telefone, nome ou apelido</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="identifier" placeholder="Ex.: Heitor ou 11999999999" autoComplete="username" className="pl-10" />
          </div>
        </div>
        <div>
          <Label>PIN de 4 dígitos</Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input name="pin" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="current-password" className="pl-10 text-lg tracking-[0.24em]" />
          </div>
        </div>
        {state?.error ? <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700">{state.error}</div> : null}
        <Button disabled={pending} className="w-full rounded-[22px] py-3 text-base font-bold">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {helper ? <p className="mt-4 rounded-[22px] bg-slate-50 px-3.5 py-3 text-sm text-muted-foreground">{helper}</p> : null}
    </Card>
  );
}
