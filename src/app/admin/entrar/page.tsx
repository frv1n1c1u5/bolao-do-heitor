import { Crown, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { loginAdminAction } from "@/actions/auth";
import { LoginForm } from "@/components/login-form";
import { PageContainer } from "@/components/ui";

export default function AdminLoginPage() {
  return (
    <main className="app-shell flex-1 overflow-hidden">
      <PageContainer>
        <div className="grid min-h-[calc(100dvh-2rem)] items-center gap-8 py-6 lg:grid-cols-[1fr_0.95fr] lg:py-10">
          <section className="mx-auto w-full max-w-xl text-center lg:text-left">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-sm lg:mx-0">
              <Crown className="h-4 w-4" aria-hidden />
              Organização da Copa
            </div>
            <h1 className="text-4xl font-black leading-[0.96] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Painel simples para montar cada dia da Copa.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground lg:mx-0">
              Busque os jogos do dia, escolha quais entram no bolão, confirme pagamentos e atualize resultados pela football-data.org.
            </p>

            <div className="mt-6 grid gap-3 rounded-[30px] border border-white/70 bg-white/78 p-4 shadow-[0_20px_60px_rgba(15,35,55,0.10)] backdrop-blur">
              <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(0,128,105,0.10),rgba(59,130,246,0.08),rgba(255,255,255,0.92))] p-4">
                <div className="text-sm font-black text-foreground">Acesso restrito</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Os administradores iniciais também são jogadores cadastrados. As credenciais não ficam expostas na tela.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-background/82 p-3">
                  <div className="text-sm font-black text-foreground">Fluxo</div>
                  <div className="text-xs font-semibold text-muted-foreground">jogos, bolões, PIX e ranking</div>
                </div>
                <div className="rounded-2xl bg-background/82 p-3">
                  <div className="text-sm font-black text-foreground">Base única</div>
                  <div className="text-xs font-semibold text-muted-foreground">admins e jogadores no mesmo cadastro</div>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full">
            <LoginForm
              action={loginAdminAction}
              title="Entrar como admin"
              subtitle="Use um administrador já cadastrado no sistema."
              helper="Depois do login, cadastre os jogadores e entregue nome + PIN para cada um."
            />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Voltar para jogadores? <Link className="font-semibold text-primary" href="/entrar">Ir para entrada</Link>
            </p>
            <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-2xl bg-white/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              Acesso separado da área dos jogadores.
            </div>
          </section>
        </div>
      </PageContainer>
    </main>
  );
}
