export const dynamic = "force-dynamic";

import { UserRole } from "@prisma/client";

import { logoutAction } from "@/actions/auth";
import { PlayerNavShell } from "@/components/nav-shell";
import { PageContainer, Button } from "@/components/ui";
import { requireUser } from "@/lib/auth";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser(UserRole.PLAYER);

  return (
    <main className="app-shell flex-1">
      <PageContainer>
        <div className="mb-4 flex items-center justify-between gap-3 pt-2">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-primary">Bolao do Heitor</div>
            <div className="text-sm text-muted-foreground">Ola, {session.user.nickname || session.user.name}</div>
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
