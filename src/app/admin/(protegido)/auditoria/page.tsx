import { AppHeader } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function AdminAuditPage() {
  const logs = await getDb().auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <AppHeader title="Auditoria" subtitle="Registro das acoes criticas do admin e mutacoes relevantes do sistema." />
      <Card className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl bg-background/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{log.action}</div>
                <div className="text-sm text-muted-foreground">{log.entityType} - {log.entityId}</div>
                <div className="text-sm text-muted-foreground">Por: {log.actor?.nickname || log.actor?.name || "Sistema"}</div>
              </div>
              <div className="text-sm text-muted-foreground">{formatDateTime(log.createdAt)}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
