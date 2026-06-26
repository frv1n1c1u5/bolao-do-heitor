import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8">{children}</div>;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("surface rounded-[28px] p-4 sm:p-5", className)}>{children}</section>;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variantClass = {
    primary: "bg-secondary text-secondary-foreground shadow-[0_16px_30px_rgba(0,135,90,0.22)]",
    secondary: "bg-primary text-primary-foreground shadow-[0_16px_30px_rgba(13,27,54,0.18)]",
    ghost: "border border-slate-300/50 bg-white/75 text-foreground",
    danger: "bg-danger text-white shadow-[0_16px_28px_rgba(209,67,67,0.18)]",
  }[variant];

  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
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
        "input-like min-h-12 w-full rounded-2xl border border-slate-200/70 bg-white/88 px-3.5 py-2 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-slate-950/40",
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
        "input-like min-h-28 w-full rounded-2xl border border-slate-200/70 bg-white/88 px-3.5 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-slate-950/40",
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
        "input-like min-h-12 w-full rounded-2xl border border-slate-200/70 bg-white/88 px-3.5 py-2 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-slate-950/40",
        props.className,
      )}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-foreground">{children}</label>;
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "navy" | "mint" | "gold" | "rose";
}) {
  const toneClass = {
    default: "bg-white/72",
    navy: "bg-[linear-gradient(135deg,rgba(13,27,54,0.96),rgba(29,57,107,0.92))] text-white",
    mint: "bg-[linear-gradient(135deg,rgba(210,248,228,0.96),rgba(233,252,242,0.92))]",
    gold: "bg-[linear-gradient(135deg,rgba(255,244,214,0.96),rgba(255,250,236,0.92))]",
    rose: "bg-[linear-gradient(135deg,rgba(255,236,236,0.96),rgba(255,245,245,0.92))]",
  }[tone];

  return (
    <div className={cn("metric-glow rounded-[26px] border border-white/70 p-4", toneClass)}>
      <div className={cn("text-[11px] font-extrabold uppercase tracking-[0.12em]", tone === "navy" ? "text-white/68" : "text-muted-foreground")}>{label}</div>
      <div className={cn("mt-3 text-[1.9rem] font-black leading-none", tone === "navy" ? "text-white" : "text-foreground")}>{value}</div>
      {hint ? <div className={cn("mt-3 text-sm", tone === "navy" ? "text-emerald-300" : "text-muted-foreground")}>{hint}</div> : null}
    </div>
  );
}
