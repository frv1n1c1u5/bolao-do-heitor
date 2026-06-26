"use client";

import { usePathname } from "next/navigation";

import { AdminNav, PlayerBottomNav } from "@/components/app-shell";

export function PlayerNavShell() {
  const pathname = usePathname();
  return <PlayerBottomNav pathname={pathname} />;
}

export function AdminNavShell() {
  const pathname = usePathname();
  return <AdminNav pathname={pathname} />;
}
