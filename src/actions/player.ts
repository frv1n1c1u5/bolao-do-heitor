"use server";

import { PaymentStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logAudit, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isPredictionLocked, recalculatePoolRanking } from "@/lib/pools";
import { inferWinner } from "@/lib/scoring";

export async function joinPoolAction(formData: FormData) {
  const session = await requireUser(UserRole.PLAYER);
  const poolId = String(formData.get("poolId"));
  const db = getDb();

  const entry = await db.poolEntry.upsert({
    where: { poolId_userId: { poolId, userId: session.user.id } },
    update: {},
    create: {
      poolId,
      userId: session.user.id,
      paymentStatus: PaymentStatus.PENDING,
    },
  });

  await logAudit({
    actorUserId: session.user.id,
    action: "POOL_JOINED",
    entityType: "PoolEntry",
    entityId: entry.id,
  });

  revalidatePath(`/app/boloes/${poolId}`);
  revalidatePath("/app/meus-boloes");
  redirect(`/app/boloes/${poolId}`);
}

export async function markPaidAction(formData: FormData) {
  const session = await requireUser(UserRole.PLAYER);
  const poolId = String(formData.get("poolId"));
  const db = getDb();
  const entry = await db.poolEntry.update({
    where: { poolId_userId: { poolId, userId: session.user.id } },
    data: {
      paymentStatus: PaymentStatus.WAITING_CONFIRMATION,
      markedAsPaidAt: new Date(),
    },
  });

  await logAudit({
    actorUserId: session.user.id,
    action: "PAYMENT_MARKED_BY_PLAYER",
    entityType: "PoolEntry",
    entityId: entry.id,
    newValue: { paymentStatus: PaymentStatus.WAITING_CONFIRMATION },
  });

  revalidatePath(`/app/boloes/${poolId}`);
  revalidatePath("/admin/pagamentos");
}

export async function savePredictionsAction(formData: FormData) {
  const session = await requireUser(UserRole.PLAYER);
  const poolId = String(formData.get("poolId"));
  const db = getDb();
  const pool = await db.pool.findUniqueOrThrow({
    where: { id: poolId },
    include: { poolMatches: { include: { match: true } } },
  });
  const entry = await db.poolEntry.findUniqueOrThrow({
    where: { poolId_userId: { poolId, userId: session.user.id } },
  });

  for (const poolMatch of pool.poolMatches) {
    const homeKey = `home_${poolMatch.matchId}`;
    const awayKey = `away_${poolMatch.matchId}`;
    const homeValue = formData.get(homeKey);
    const awayValue = formData.get(awayKey);

    if (homeValue === null || awayValue === null || homeValue === "" || awayValue === "") {
      continue;
    }

    if (isPredictionLocked(poolMatch.match.localDate, pool.cutoffDateTime)) {
      continue;
    }

    const predictedHomeScore = Number(homeValue);
    const predictedAwayScore = Number(awayValue);

    await db.prediction.upsert({
      where: { poolEntryId_matchId: { poolEntryId: entry.id, matchId: poolMatch.matchId } },
      update: {
        predictedHomeScore,
        predictedAwayScore,
        predictedWinner: inferWinner(predictedHomeScore, predictedAwayScore),
      },
      create: {
        poolEntryId: entry.id,
        matchId: poolMatch.matchId,
        predictedHomeScore,
        predictedAwayScore,
        predictedWinner: inferWinner(predictedHomeScore, predictedAwayScore),
      },
    });
  }

  await logAudit({
    actorUserId: session.user.id,
    action: "PREDICTIONS_SAVED",
    entityType: "PoolEntry",
    entityId: entry.id,
  });

  await recalculatePoolRanking(poolId, session.user.id);
  revalidatePath(`/app/boloes/${poolId}`);
  revalidatePath(`/app/ranking/${poolId}`);
}

