export const dynamic = "force-dynamic";

import { logoutAction } from "@/actions/auth";
import { AdminNavShell } from "@/components/nav-shell";
import { PageContainer, Button } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser(UserRole.ADMIN);

  return (
    <main className="app-shell flex-1">
      <PageContainer>
        <div className="mb-4 flex items-center justify-between gap-3 pt-2">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-primary">Bolao do Heitor</div>
            <div className="text-sm text-muted-foreground">Admin: {session.user.nickname || session.user.name}</div>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost">Sair</Button>
          </form>
        </div>
        <AdminNavShell />
        {children}
      </PageContainer>
    </main>
  );
}
