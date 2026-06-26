import {
  Award,
  CircleDollarSign,
  ClipboardList,
  History,
  LayoutDashboard,
  ShieldCheck,
  Trophy,
  UserCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

const statusLabelMap: Record<string, string> = {
  WAITING_CONFIRMATION: "Aguardando confirmação",
  IN_PROGRESS: "Em andamento",
  FINISHED: "Finalizado",
  OPEN: "Aberto",
  CLOSED: "Fechado",
  SCORING: "Apuração",
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  REJECTED: "Recusado",
  PAID: "Pago",
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ADMIN: "Admin",
  PLAYER: "Jogador",
};

export function StatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    OPEN: "bg-emerald-100 text-emerald-800",
    CLOSED: "bg-slate-200 text-slate-700",
    IN_PROGRESS: "bg-amber-100 text-amber-800",
    SCORING: "bg-sky-100 text-sky-800",
    FINISHED: "bg-indigo-100 text-indigo-800",
    PENDING: "bg-slate-100 text-slate-700",
    WAITING_CONFIRMATION: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-rose-100 text-rose-800",
    PAID: "bg-violet-100 text-violet-800",
    ACTIVE: "bg-emerald-100 text-emerald-800",
    INACTIVE: "bg-slate-100 text-slate-700",
    ADMIN: "bg-sky-100 text-sky-800",
    PLAYER: "bg-violet-100 text-violet-800",
  };

  return (
    <span className={cn("badge border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]", styleMap[status] ?? "bg-muted text-foreground")}>
      {statusLabelMap[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}

export function AppHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <div className="kicker mb-3">{eyebrow}</div> : null}
        <h1 className="text-[2rem] font-black leading-[0.98] tracking-tight text-foreground sm:text-[2.35rem]">{title}</h1>
        {subtitle ? <p className="section-copy mt-3 max-w-xl">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

const playerNav = [
  { href: "/app", label: "Home", icon: LayoutDashboard },
  { href: "/app/boloes", label: "Bolões", icon: Trophy },
  { href: "/app/meus-boloes", label: "Meus", icon: ClipboardList },
  { href: "/app/historico", label: "Histórico", icon: History },
  { href: "/app/perfil", label: "Perfil", icon: UserCircle2 },
];

export function PlayerBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-white/65 bg-white/75 p-2 shadow-[0_22px_40px_rgba(10,24,56,0.16)] backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:w-[430px] sm:-translate-x-1/2">
      <ul className="grid grid-cols-5 gap-1.5">
        {playerNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-15 flex-col items-center justify-center rounded-[22px] px-1 text-[11px] font-semibold transition",
                  isActive
                    ? "bg-emerald-50 text-secondary shadow-[inset_0_0_0_1px_rgba(0,135,90,0.08)]"
                    : "text-muted-foreground",
                )}
              >
                <Icon className={cn("mb-1 h-4.5 w-4.5", isActive && "text-secondary")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jogadores", label: "Jogadores", icon: Users },
  { href: "/admin/boloes", label: "Bolões", icon: Trophy },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: CircleDollarSign },
  { href: "/admin/caixa", label: "Caixa", icon: Award },
];

export function AdminNav({ pathname }: { pathname: string }) {
  return (
    <div className="mb-5 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2 rounded-[24px] border border-white/60 bg-white/70 p-2 shadow-[0_12px_24px_rgba(10,24,56,0.08)] backdrop-blur-xl">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-semibold transition",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_10px_18px_rgba(13,27,54,0.18)]"
                  : "text-muted-foreground hover:bg-white/65 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <span className="ml-auto hidden items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-secondary lg:inline-flex">
          <ShieldCheck className="h-4 w-4" />
          Copa 2026
        </span>
      </div>
    </div>
  );
}
