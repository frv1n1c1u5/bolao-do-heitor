import { ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";

import { loginPlayerAction } from "@/actions/auth";
import { LoginForm } from "@/components/login-form";
import { PageContainer } from "@/components/ui";

export default function PlayerLoginPage() {
  return (
    <main className="app-shell flex-1 overflow-hidden">
      <PageContainer>
        <div className="grid min-h-[calc(100dvh-2rem)] items-center gap-8 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-10">
          <section className="mx-auto w-full max-w-xl text-center lg:text-left">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-sm lg:mx-0">
              <Trophy className="h-4 w-4" aria-hidden />
              Bolão do Heitor
            </div>
            <h1 className="text-4xl font-black leading-[0.96] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Palpite rápido, Pix simples, ranking justo.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground lg:mx-0">
              Entre com seu acesso, escolha o bolão, envie seus palpites e acompanhe tudo pelo celular.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-[26px] border border-white/70 bg-white/75 p-2 shadow-[0_18px_60px_rgba(15,35,55,0.10)] backdrop-blur">
              <div className="rounded-2xl bg-background/80 p-3 text-center">
                <div className="text-xl font-black text-primary">30%</div>
                <div className="text-[11px] font-semibold text-muted-foreground">casa</div>
              </div>
              <div className="rounded-2xl bg-background/80 p-3 text-center">
                <div className="text-xl font-black text-primary">70%</div>
                <div className="text-[11px] font-semibold text-muted-foreground">prêmio</div>
              </div>
              <div className="rounded-2xl bg-background/80 p-3 text-center">
                <div className="text-xl font-black text-primary">PIN</div>
                <div className="text-[11px] font-semibold text-muted-foreground">4 dígitos</div>
              </div>
            </div>
          </section>

          <section className="w-full">
            <LoginForm
              action={loginPlayerAction}
              title="Entrar no bolão"
              subtitle="Use o nome, apelido ou telefone cadastrado pelo administrador."
              helper="Os palpites ficam privados até o jogo começar."
            />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Área do organizador? <Link className="font-semibold text-primary" href="/admin/entrar">Entrar como admin</Link>
            </p>
            <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-white/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              Sem cadastro público. O admin cria os jogadores.
            </div>
          </section>
        </div>
      </PageContainer>
    </main>
  );
}
