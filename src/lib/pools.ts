import "server-only";

import {
  MatchStatus,
  PaymentStatus,
  PoolStatus,
  PrizeStatus,
  Prisma,
} from "@prisma/client";

import { logAudit } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { fetchMatchById } from "@/lib/football-data";
import { rankPlayers, scorePrediction } from "@/lib/scoring";

export function getPredictionLockTime(matchDate: Date, cutoffDateTime?: Date | null) {
  if (!cutoffDateTime) return matchDate;
  return matchDate < cutoffDateTime ? matchDate : cutoffDateTime;
}

export function isPredictionLocked(matchDate: Date, cutoffDateTime?: Date | null) {
  return getPredictionLockTime(matchDate, cutoffDateTime).getTime() <= Date.now();
}

export function entryHasCompletePredictions(
  predictionCount: number,
  totalMatches: number,
) {
  return totalMatches > 0 && predictionCount === totalMatches;
}

export async function ensureDefaultSettings() {
  const db = getDb();
  const settings = await db.adminSettings.findFirst({ orderBy: { createdAt: "asc" } });
  if (settings) return settings;
  return db.adminSettings.create({
    data: {
      pixReceiverName: "Bolao do Heitor",
      paymentInstructions:
        "Apos pagar, clique em Ja paguei e aguarde a confirma--o manual do admin.",
    },
  });
}

export async function upsertMatchesFromApi(externalApiIds: number[], actorUserId?: string) {
  const db = getDb();
  const saved = [];

  for (const externalApiId of externalApiIds) {
    const match = await fetchMatchById(externalApiId);
    const record = await db.match.upsert({
      where: { externalApiId },
      update: match,
      create: match,
    });
    saved.push(record);
    await logAudit({
      actorUserId,
      action: "MATCH_UPSERTED_FROM_API",
      entityType: "Match",
      entityId: record.id,
      newValue: { externalApiId },
    });
  }

  return saved;
}

export async function syncPoolResults(poolId: string, actorUserId?: string) {
  const db = getDb();
  const pool = await db.pool.findUnique({
    where: { id: poolId },
    include: {
      poolMatches: { include: { match: true } },
    },
  });

  if (!pool) throw new Error("Bolao nao encontrado.");

  for (const poolMatch of pool.poolMatches) {
    const fresh = await fetchMatchById(poolMatch.match.externalApiId);
    await db.match.update({
      where: { id: poolMatch.matchId },
      data: fresh,
    });
  }

  await logAudit({
    actorUserId,
    action: "POOL_RESULTS_SYNCED",
    entityType: "Pool",
    entityId: poolId,
  });

  return recalculatePoolRanking(poolId, actorUserId);
}

export async function recalculatePoolRanking(poolId: string, actorUserId?: string) {
  const db = getDb();
  const pool = await db.pool.findUnique({
    where: { id: poolId },
    include: {
      poolMatches: { include: { match: true } },
      entries: {
        include: {
          user: true,
          predictions: {
            include: { match: true },
          },
        },
      },
    },
  });

  if (!pool) throw new Error("Bolao nao encontrado.");

  for (const entry of pool.entries) {
    for (const prediction of entry.predictions) {
      const match = prediction.match;
      if (
        match.status === MatchStatus.FINISHED &&
        match.homeScore !== null &&
        match.awayScore !== null
      ) {
        const score = scorePrediction({
          predictedHomeScore: prediction.predictedHomeScore,
          predictedAwayScore: prediction.predictedAwayScore,
          actualHomeScore: match.homeScore,
          actualAwayScore: match.awayScore,
        });

        await db.prediction.update({
          where: { id: prediction.id },
          data: {
            predictedWinner: score.predictedWinner,
            points: score.points,
            exactScoreHit: score.exactScoreHit,
            winnerHit: score.winnerHit,
            goalDifferenceError: score.goalDifferenceError,
            lockedAt: getPredictionLockTime(match.localDate, pool.cutoffDateTime),
          },
        });
      }
    }
  }

  const eligibleRows = pool.entries
    .filter(
      (entry) =>
        entry.paymentStatus === PaymentStatus.CONFIRMED &&
        entryHasCompletePredictions(entry.predictions.length, pool.poolMatches.length),
    )
    .map((entry) => ({
      userId: entry.userId,
      totalPoints: entry.predictions.reduce((sum, prediction) => sum + prediction.points, 0),
      exactScores: entry.predictions.filter((prediction) => prediction.exactScoreHit).length,
      correctWinners: entry.predictions.filter((prediction) => prediction.winnerHit).length,
      totalGoalDifferenceError: entry.predictions.reduce(
        (sum, prediction) => sum + prediction.goalDifferenceError,
        0,
      ),
    }));

  const ranking = rankPlayers({
    pool,
    rows: eligibleRows,
  });

  await db.poolRanking.deleteMany({ where: { poolId } });
  if (ranking.length) {
    await db.poolRanking.createMany({
      data: ranking.map((row) => ({
        poolId,
        userId: row.userId,
        totalPoints: row.totalPoints,
        exactScores: row.exactScores,
        correctWinners: row.correctWinners,
        totalGoalDifferenceError: row.totalGoalDifferenceError,
        position: row.position,
        isTechnicalTie: row.isTechnicalTie,
        prizeAmount: new Prisma.Decimal(row.prizeAmount.toFixed(2)),
      })),
    });
  }

  const allFinished = pool.poolMatches.every((poolMatch) => poolMatch.match.status === MatchStatus.FINISHED);
  const anyStarted = pool.poolMatches.some((poolMatch) =>
    poolMatch.match.status === MatchStatus.IN_PLAY ||
    poolMatch.match.status === MatchStatus.PAUSED ||
    poolMatch.match.status === MatchStatus.FINISHED,
  );

  await db.pool.update({
    where: { id: poolId },
    data: {
      status: allFinished
        ? PoolStatus.FINISHED
        : anyStarted
          ? PoolStatus.IN_PROGRESS
          : pool.status,
    },
  });

  for (const entry of pool.entries) {
    const row = ranking.find((item) => item.userId === entry.userId);
    await db.poolEntry.update({
      where: { id: entry.id },
      data: {
        prizeStatus:
          row && row.position <= 3 && Number(row.prizeAmount.toFixed(2)) > 0
            ? entry.prizeStatus === PrizeStatus.PAID
              ? PrizeStatus.PAID
              : PrizeStatus.PENDING
            : PrizeStatus.NONE,
      },
    });
  }

  await logAudit({
    actorUserId,
    action: "POOL_RANKING_RECALCULATED",
    entityType: "Pool",
    entityId: poolId,
  });

  return ranking;
}

export async function getAdminDashboardData() {
  const db = getDb();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [matchesToday, pools, pendingPayments, pendingPrizes, recentWinners] = await Promise.all([
    db.match.findMany({
      where: { localDate: { gte: todayStart, lt: tomorrow } },
      orderBy: { localDate: "asc" },
      take: 6,
    }),
    db.pool.findMany({
      orderBy: [{ status: "asc" }, { poolDate: "desc" }],
      include: { entries: true, rankings: true, poolMatches: true },
      take: 8,
    }),
    db.poolEntry.findMany({
      where: { paymentStatus: PaymentStatus.WAITING_CONFIRMATION },
      include: { user: true, pool: true },
      take: 8,
      orderBy: { markedAsPaidAt: "desc" },
    }),
    db.poolEntry.findMany({
      where: { prizeStatus: PrizeStatus.PENDING },
      include: { user: true, pool: true },
      take: 8,
      orderBy: { updatedAt: "desc" },
    }),
    db.poolRanking.findMany({
      where: { pool: { status: PoolStatus.FINISHED }, position: 1 },
      include: { user: true, pool: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const todayPools = pools.filter((pool) => pool.poolDate >= todayStart && pool.poolDate < tomorrow);
  const totals = todayPools.reduce(
    (acc, pool) => {
      const confirmedCount = pool.entries.filter((entry) => entry.paymentStatus === PaymentStatus.CONFIRMED).length;
      const gross = Number(pool.entryFee) * confirmedCount;
      acc.gross += gross;
      acc.house += gross * (Number(pool.houseFeePercentage) / 100);
      acc.prize += gross * (Number(pool.prizePercentage) / 100);
      return acc;
    },
    { gross: 0, house: 0, prize: 0 },
  );

  return {
    matchesToday,
    pools,
    pendingPayments,
    pendingPrizes,
    recentWinners,
    totals,
  };
}

export async function getPlayerDashboardData(userId: string) {
  const db = getDb();
  const [openPools, myEntries, nextMatch, pendingPayments, history] = await Promise.all([
    db.pool.findMany({
      where: { status: { in: [PoolStatus.OPEN, PoolStatus.CLOSED, PoolStatus.IN_PROGRESS] } },
      include: { poolMatches: { include: { match: true } }, entries: { where: { userId } } },
      orderBy: { poolDate: "asc" },
      take: 8,
    }),
    db.poolEntry.findMany({
      where: { userId },
      include: { pool: true, predictions: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.match.findFirst({
      where: { localDate: { gte: new Date() } },
      orderBy: { localDate: "asc" },
    }),
    db.poolEntry.findMany({
      where: { userId, paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.WAITING_CONFIRMATION] } },
      include: { pool: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.poolRanking.findMany({
      where: { userId, pool: { status: PoolStatus.FINISHED } },
      include: { pool: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    openPools,
    myEntries,
    nextMatch,
    pendingPayments,
    history,
  };
}

export async function getHallOfFame() {
  const db = getDb();
  const rankings = await db.poolRanking.findMany({
    where: { pool: { status: PoolStatus.FINISHED, entries: { some: { paymentStatus: PaymentStatus.CONFIRMED } } } },
    include: { user: true, pool: true },
  });

  const map = new Map<string, {
    userId: string;
    name: string;
    wins: number;
    prizes: number;
    participations: number;
    points: number;
    exactScores: number;
  }>();

  for (const ranking of rankings) {
    const entry = map.get(ranking.userId) ?? {
      userId: ranking.userId,
      name: ranking.user.nickname || ranking.user.name,
      wins: 0,
      prizes: 0,
      participations: 0,
      points: 0,
      exactScores: 0,
    };

    entry.participations += 1;
    entry.points += ranking.totalPoints;
    entry.exactScores += ranking.exactScores;
    entry.prizes += Number(ranking.prizeAmount);
    if (ranking.position === 1) entry.wins += 1;
    map.set(ranking.userId, entry);
  }

  return [...map.values()].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.prizes - a.prizes;
  });
}

