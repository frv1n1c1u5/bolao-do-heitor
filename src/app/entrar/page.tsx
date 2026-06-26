import { ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";

import { loginPlayerAction } from "@/actions/auth";
import { LoginForm } from "@/components/login-form";
import { PageContainer } from "@/components/ui";

export default function PlayerLoginPage() {
  return (
    <main className="app-shell flex-1 overflow-hidden">
      <PageContainer>
        <div className="grid min-h-[calc(100dvh-2rem)] items-center gap-8 py-6 lg:grid-cols-[1fr_0.95fr] lg:py-10">
          <section className="mx-auto w-full max-w-xl text-center lg:text-left">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-sm lg:mx-0">
              <Trophy className="h-4 w-4" aria-hidden />
              Bolão do Heitor
            </div>

            <div className="rounded-[34px] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(246,250,255,0.88))] p-6 shadow-[0_24px_80px_rgba(15,35,55,0.12)]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                Copa do Mundo 2026
              </div>
              <h1 className="text-4xl font-black leading-[0.96] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Seu bolão da Copa, leve e feito para o celular.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
                Entre com o acesso criado pelo administrador, escolha os jogos do dia e acompanhe palpites, ranking e resultados em uma tela simples.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/78 p-4 shadow-sm">
                <div className="text-sm font-black text-foreground">Jogos do dia</div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">Cada bolão nasce de um único dia da Copa.</div>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/78 p-4 shadow-sm">
                <div className="text-sm font-black text-foreground">Palpite privado</div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">Os outros palpites só aparecem depois do apito inicial.</div>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/78 p-4 shadow-sm">
                <div className="text-sm font-black text-foreground">Ranking correto</div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">Só entra no ranking quem participou e teve pagamento confirmado.</div>
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
