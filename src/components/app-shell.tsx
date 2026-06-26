import {
  Award,
  CircleDollarSign,
  ClipboardList,
  History,
  LayoutDashboard,
  Trophy,
  UserCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export function StatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    OPEN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    CLOSED: "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    SCORING: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    FINISHED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    PENDING: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    WAITING_CONFIRMATION: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    CONFIRMED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    REJECTED: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    PAID: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    INACTIVE: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  };

  return <span className={cn("badge", styleMap[status] ?? "bg-muted text-foreground")}>{status.replaceAll("_", " ")}</span>;
}

export function AppHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="section-copy mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

const playerNav = [
  { href: "/app", label: "Inicio", icon: LayoutDashboard },
  { href: "/app/boloes", label: "Boloes", icon: Trophy },
  { href: "/app/meus-boloes", label: "Meus", icon: ClipboardList },
  { href: "/app/historico", label: "Historico", icon: History },
  { href: "/app/perfil", label: "Perfil", icon: UserCircle2 },
];

export function PlayerBottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="surface fixed inset-x-3 bottom-3 z-40 rounded-2xl p-2 sm:inset-x-auto sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2">
      <ul className="grid grid-cols-5 gap-1">
        {playerNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center rounded-xl text-[11px] font-semibold",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="mb-1 h-4 w-4" />
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
  { href: "/admin/boloes", label: "Boloes", icon: Trophy },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: CircleDollarSign },
  { href: "/admin/caixa", label: "Caixa", icon: Award },
];

export function AdminNav({ pathname }: { pathname: string }) {
  return (
    <div className="mb-4 overflow-x-auto">
      <div className="flex min-w-max gap-2">
        {adminNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "surface inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
                active && "bg-primary text-primary-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
