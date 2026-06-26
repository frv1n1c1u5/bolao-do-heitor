import { Crown, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { loginAdminAction } from "@/actions/auth";
import { LoginForm } from "@/components/login-form";
import { PageContainer } from "@/components/ui";

export default function AdminLoginPage() {
  return (
    <main className="app-shell flex-1 overflow-hidden">
      <PageContainer>
        <div className="grid min-h-[calc(100dvh-2rem)] items-center gap-8 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-10">
          <section className="mx-auto w-full max-w-xl text-center lg:text-left">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-sm lg:mx-0">
              <Crown className="h-4 w-4" aria-hidden />
              Admin do bolão
            </div>
            <h1 className="text-4xl font-black leading-[0.96] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Controle jogadores, Pix e apuração.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground lg:mx-0">
              Painel simples para criar bolões, confirmar pagamentos e atualizar resultados pela football-data.org.
            </p>

            <div className="mt-6 rounded-[26px] border border-white/70 bg-white/75 p-3 shadow-[0_18px_60px_rgba(15,35,55,0.10)] backdrop-blur">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-background/80 p-3">
                  <div className="text-sm font-black text-foreground">Heitor</div>
                  <div className="text-xs font-semibold text-muted-foreground">PIN 0000</div>
                </div>
                <div className="rounded-2xl bg-background/80 p-3">
                  <div className="text-sm font-black text-foreground">Vinicius</div>
                  <div className="text-xs font-semibold text-muted-foreground">PIN 9999</div>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full">
            <LoginForm
              action={loginAdminAction}
              title="Entrar como admin"
              subtitle="Use um dos administradores iniciais ou outro admin cadastrado."
              helper="Depois do login, cadastre jogadores e passe nome + PIN para cada um."
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
