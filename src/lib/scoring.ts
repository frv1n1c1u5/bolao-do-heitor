import "server-only";

import { PaymentStatus, type Pool, type PoolEntry, PrizeMode, type PoolRanking, Winner } from "@prisma/client";
import Decimal from "decimal.js";

type RankingRow = {
  userId: string;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  totalGoalDifferenceError: number;
};

export function inferWinner(home: number, away: number): Winner {
  if (home > away) return Winner.HOME;
  if (home < away) return Winner.AWAY;
  return Winner.DRAW;
}

export function scorePrediction(params: {
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
}) {
  const predictedWinner = inferWinner(
    params.predictedHomeScore,
    params.predictedAwayScore,
  );
  const actualWinner = inferWinner(params.actualHomeScore, params.actualAwayScore);
  const exactScoreHit =
    params.predictedHomeScore === params.actualHomeScore &&
    params.predictedAwayScore === params.actualAwayScore;
  const winnerHit = predictedWinner === actualWinner;
  const goalDifferenceError =
    Math.abs(params.predictedHomeScore - params.actualHomeScore) +
    Math.abs(params.predictedAwayScore - params.actualAwayScore);

  return {
    predictedWinner,
    points: exactScoreHit ? 3 : winnerHit ? 1 : 0,
    exactScoreHit,
    winnerHit,
    goalDifferenceError,
  };
}

export function calculateFinancials(
  pool: Pick<
    Pool,
    | "entryFee"
    | "houseFeePercentage"
    | "prizePercentage"
        | "firstPlacePercentage"
    | "secondPlacePercentage"
    | "thirdPlacePercentage"
  > & { entries?: Pick<PoolEntry, "paymentStatus">[] },
) {
  const confirmedCount =
    pool.entries?.filter((entry) => entry.paymentStatus === PaymentStatus.CONFIRMED)
      .length ?? 0;
  const gross = new Decimal(pool.entryFee.toString()).mul(confirmedCount);
  const house = gross.mul(new Decimal(pool.houseFeePercentage.toString()).div(100));
  const netPrize = gross.mul(new Decimal(pool.prizePercentage.toString()).div(100));

  return { confirmedCount, gross, house, netPrize };
}

export function prizeDefaults(mode: PrizeMode) {
  if (mode === PrizeMode.TOP2) return { first: 70, second: 30, third: 0 };
  if (mode === PrizeMode.TOP3) return { first: 60, second: 30, third: 10 };
  return { first: 100, second: 0, third: 0 };
}

export function rankPlayers(params: {
  pool: Pick<
    Pool,
    | "entryFee"
    | "houseFeePercentage"
    | "prizePercentage"
    | "firstPlacePercentage"
    | "secondPlacePercentage"
    | "thirdPlacePercentage"
  > & { entries: Pick<PoolEntry, "paymentStatus">[] };
  rows: RankingRow[];
}) {
  const sorted = [...params.rows].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
    if (b.correctWinners !== a.correctWinners) return b.correctWinners - a.correctWinners;
    return a.totalGoalDifferenceError - b.totalGoalDifferenceError;
  });

  const { netPrize } = calculateFinancials(params.pool);

  return sorted.map((row, index) => {
    const previous = sorted[index - 1];
    const isTechnicalTie =
      !!previous &&
      previous.totalPoints === row.totalPoints &&
      previous.exactScores === row.exactScores &&
      previous.correctWinners === row.correctWinners &&
      previous.totalGoalDifferenceError === row.totalGoalDifferenceError;

    const position = isTechnicalTie ? index : index + 1;

    let prizeAmount = new Decimal(0);
    if (position === 1) {
      prizeAmount = netPrize.mul(new Decimal(params.pool.firstPlacePercentage.toString()).div(100));
    }
    if (position === 2) {
      prizeAmount = netPrize.mul(new Decimal(params.pool.secondPlacePercentage.toString()).div(100));
    }
    if (position === 3) {
      prizeAmount = netPrize.mul(new Decimal(params.pool.thirdPlacePercentage.toString()).div(100));
    }

    return {
      ...row,
      position,
      isTechnicalTie,
      prizeAmount,
    };
  });
}

export type PersistedRanking = Pick<
  PoolRanking,
  | "userId"
  | "totalPoints"
  | "exactScores"
  | "correctWinners"
  | "totalGoalDifferenceError"
  | "position"
  | "isTechnicalTie"
> & { prizeAmount: Decimal };
