export const dynamic = "force-dynamic";

import { UserRole } from "@prisma/client";
import { ShieldCheck } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { PlayerNavShell } from "@/components/nav-shell";
import { PageContainer, Button } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser([UserRole.PLAYER, UserRole.ADMIN]);

  return (
    <main className="app-shell flex-1">
      <PageContainer>
        <div className="mb-5 flex items-center justify-between gap-3 pt-2">
          <div>
            <div className="kicker mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Bolão do Heitor
            </div>
            <div className="text-sm text-muted-foreground">Olá, {session.user.nickname || session.user.name}</div>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost">Sair</Button>
          </form>
        </div>
        {children}
      </PageContainer>
      <PlayerNavShell />
    </main>
  );
}
