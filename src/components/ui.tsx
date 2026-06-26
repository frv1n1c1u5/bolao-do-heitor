import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-24 pt-4 sm:px-6">{children}</div>;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("surface rounded-2xl p-4 sm:p-5", className)}>{children}</section>;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variantClass = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    ghost: "bg-transparent text-foreground border border-slate-300/40",
    danger: "bg-danger text-white",
  }[variant];

  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        className,
      )}
      {...props}
    />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "input-like min-h-12 w-full rounded-xl border border-slate-300/50 bg-white/90 px-3 py-2 text-sm text-foreground shadow-sm dark:bg-slate-950/40",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "input-like min-h-28 w-full rounded-xl border border-slate-300/50 bg-white/90 px-3 py-2 text-sm text-foreground shadow-sm dark:bg-slate-950/40",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "input-like min-h-12 w-full rounded-xl border border-slate-300/50 bg-white/90 px-3 py-2 text-sm text-foreground shadow-sm dark:bg-slate-950/40",
        props.className,
      )}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-foreground">{children}</label>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-background/70 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
