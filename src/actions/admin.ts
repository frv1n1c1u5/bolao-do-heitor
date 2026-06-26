"use server";

import {
  PaymentStatus,
  PoolStatus,
  PoolType,
  PrizeMode,
  PrizeStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hashPin, logAudit, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { upsertMatchesFromApi, syncPoolResults, recalculatePoolRanking } from "@/lib/pools";
import { prizeDefaults } from "@/lib/scoring";

const playerSchema = z.object({
  name: z.string().min(2),
  nickname: z.string().optional(),
  phone: z.string().min(10),
  pin: z.string().regex(/^\d{4}$/),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
});

export async function createPlayerAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const parsed = playerSchema.parse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || undefined,
    phone: String(formData.get("phone") ?? "").replace(/\D/g, ""),
    pin: formData.get("pin"),
    status: formData.get("status") ?? UserStatus.ACTIVE,
  });

  const db = getDb();
  const user = await db.user.create({
    data: {
      name: parsed.name,
      nickname: parsed.nickname,
      phone: parsed.phone,
      pinHash: await hashPin(parsed.pin),
      role: UserRole.PLAYER,
      status: parsed.status,
    },
  });

  await logAudit({
    actorUserId: session.user.id,
    action: "PLAYER_CREATED",
    entityType: "User",
    entityId: user.id,
    newValue: parsed,
  });

  revalidatePath("/admin/jogadores");
  redirect("/admin/jogadores");
}

export async function updatePlayerStatusAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const userId = String(formData.get("userId"));
  const status = z.nativeEnum(UserStatus).parse(formData.get("status"));
  const db = getDb();
  const oldValue = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const user = await db.user.update({ where: { id: userId }, data: { status } });
  await logAudit({
    actorUserId: session.user.id,
    action: "PLAYER_STATUS_UPDATED",
    entityType: "User",
    entityId: user.id,
    oldValue,
    newValue: { status },
  });
  revalidatePath("/admin/jogadores");
}

export async function resetPlayerPinAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const userId = String(formData.get("userId"));
  const pin = z.string().regex(/^\d{4}$/).parse(formData.get("pin"));
  const db = getDb();
  await db.user.update({
    where: { id: userId },
    data: { pinHash: await hashPin(pin), failedLoginAttempts: 0, lockedUntil: null },
  });
  await logAudit({
    actorUserId: session.user.id,
    action: "PLAYER_PIN_RESET",
    entityType: "User",
    entityId: userId,
  });
  revalidatePath("/admin/jogadores");
}

export async function saveAdminSettingsAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const db = getDb();
  const existing = await db.adminSettings.findFirst({ orderBy: { createdAt: "asc" } });
  const payload = {
    pixReceiverName: String(formData.get("pixReceiverName") ?? "") || null,
    pixKey: String(formData.get("pixKey") ?? "") || null,
    pixCity: String(formData.get("pixCity") ?? "") || null,
    pixCopyPaste: String(formData.get("pixCopyPaste") ?? "") || null,
    paymentInstructions: String(formData.get("paymentInstructions") ?? "") || null,
    houseFeePercentage: Number(formData.get("houseFeePercentage") ?? 30),
  };

  const settings = existing
    ? await db.adminSettings.update({ where: { id: existing.id }, data: payload })
    : await db.adminSettings.create({ data: payload });

  await logAudit({
    actorUserId: session.user.id,
    action: "ADMIN_SETTINGS_UPDATED",
    entityType: "AdminSettings",
    entityId: settings.id,
    oldValue: existing,
    newValue: payload,
  });

  revalidatePath("/admin/configuracoes");
}

export async function saveMatchesAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const ids = formData.getAll("externalApiId").map((value) => Number(value));
  if (!ids.length) return;
  await upsertMatchesFromApi(ids, session.user.id);
  revalidatePath("/admin/jogos");
  revalidatePath("/admin/boloes/novo");
}

export async function createPoolAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const db = getDb();
  const type = z.nativeEnum(PoolType).parse(formData.get("type"));
  const prizeMode = z.nativeEnum(PrizeMode).parse(formData.get("prizeMode"));
  const defaults = prizeDefaults(prizeMode);
  const matchIds = formData.getAll("matchIds").map(String);

  if (!matchIds.length) {
    throw new Error("Selecione ao menos um jogo.");
  }

  const pool = await db.pool.create({
    data: {
      name: String(formData.get("name") ?? ""),
      type,
      poolDate: new Date(String(formData.get("poolDate") ?? new Date().toISOString())),
      entryFee: Number(formData.get("entryFee") ?? 0),
      cutoffDateTime: formData.get("cutoffDateTime")
        ? new Date(String(formData.get("cutoffDateTime")))
        : null,
      status: PoolStatus.OPEN,
      houseFeePercentage: Number(formData.get("houseFeePercentage") ?? 30),
      prizePercentage: Number(formData.get("prizePercentage") ?? 70),
      prizeMode,
      firstPlacePercentage: Number(formData.get("firstPlacePercentage") ?? defaults.first),
      secondPlacePercentage: Number(formData.get("secondPlacePercentage") ?? defaults.second),
      thirdPlacePercentage: Number(formData.get("thirdPlacePercentage") ?? defaults.third),
      notes: String(formData.get("notes") ?? "") || null,
      createdById: session.user.id,
      poolMatches: {
        createMany: {
          data: matchIds.map((matchId) => ({ matchId })),
        },
      },
    },
  });

  await logAudit({
    actorUserId: session.user.id,
    action: "POOL_CREATED",
    entityType: "Pool",
    entityId: pool.id,
    newValue: { type, prizeMode, matchIds },
  });

  revalidatePath("/admin/boloes");
  revalidatePath("/app/boloes");
  redirect(`/admin/boloes/${pool.id}`);
}

export async function updatePoolStatusAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const poolId = String(formData.get("poolId"));
  const status = z.nativeEnum(PoolStatus).parse(formData.get("status"));
  const db = getDb();
  const oldValue = await db.pool.findUniqueOrThrow({ where: { id: poolId } });
  await db.pool.update({ where: { id: poolId }, data: { status } });
  await logAudit({
    actorUserId: session.user.id,
    action: "POOL_STATUS_UPDATED",
    entityType: "Pool",
    entityId: poolId,
    oldValue,
    newValue: { status },
  });
  revalidatePath("/admin/boloes");
  revalidatePath(`/admin/boloes/${poolId}`);
}

export async function confirmPaymentAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const entryId = String(formData.get("entryId"));
  const db = getDb();
  const oldValue = await db.poolEntry.findUniqueOrThrow({ where: { id: entryId } });
  const entry = await db.poolEntry.update({
    where: { id: entryId },
    data: {
      paymentStatus: PaymentStatus.CONFIRMED,
      paymentConfirmedAt: new Date(),
      paymentConfirmedById: session.user.id,
    },
  });
  await logAudit({
    actorUserId: session.user.id,
    action: "PAYMENT_CONFIRMED",
    entityType: "PoolEntry",
    entityId: entryId,
    oldValue,
    newValue: entry,
  });
  await recalculatePoolRanking(entry.poolId, session.user.id);
  revalidatePath("/admin/pagamentos");
  revalidatePath(`/admin/boloes/${entry.poolId}`);
  revalidatePath(`/app/boloes/${entry.poolId}`);
}

export async function rejectPaymentAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const entryId = String(formData.get("entryId"));
  const db = getDb();
  const oldValue = await db.poolEntry.findUniqueOrThrow({ where: { id: entryId } });
  const entry = await db.poolEntry.update({
    where: { id: entryId },
    data: {
      paymentStatus: PaymentStatus.REJECTED,
      paymentConfirmedById: session.user.id,
    },
  });
  await logAudit({
    actorUserId: session.user.id,
    action: "PAYMENT_REJECTED",
    entityType: "PoolEntry",
    entityId: entryId,
    oldValue,
    newValue: entry,
  });
  revalidatePath("/admin/pagamentos");
  revalidatePath(`/admin/boloes/${entry.poolId}`);
}

export async function syncResultsAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const poolId = String(formData.get("poolId"));
  await syncPoolResults(poolId, session.user.id);
  revalidatePath(`/admin/boloes/${poolId}`);
  revalidatePath(`/app/ranking/${poolId}`);
  revalidatePath(`/ranking/${poolId}`);
}

export async function recalculateRankingAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const poolId = String(formData.get("poolId"));
  await recalculatePoolRanking(poolId, session.user.id);
  revalidatePath(`/admin/boloes/${poolId}`);
  revalidatePath(`/app/ranking/${poolId}`);
}

export async function markPrizePaidAction(formData: FormData) {
  const session = await requireUser(UserRole.ADMIN);
  const entryId = String(formData.get("entryId"));
  const db = getDb();
  const oldValue = await db.poolEntry.findUniqueOrThrow({ where: { id: entryId } });
  await db.poolEntry.update({
    where: { id: entryId },
    data: { prizeStatus: PrizeStatus.PAID, prizePaidAt: new Date() },
  });
  await logAudit({
    actorUserId: session.user.id,
    action: "PRIZE_MARKED_PAID",
    entityType: "PoolEntry",
    entityId: entryId,
    oldValue,
    newValue: { prizeStatus: PrizeStatus.PAID },
  });
  revalidatePath("/admin/caixa");
  revalidatePath("/admin/historico");
}

