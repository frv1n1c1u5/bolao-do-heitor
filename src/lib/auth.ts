import "server-only";

import bcrypt from "bcryptjs";
import {
  PaymentStatus,
  PoolStatus,
  Prisma,
  PrizeMode,
  UserRole,
  UserStatus,
  Winner,
} from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";
import { requireServerEnv } from "@/lib/env";

const SESSION_COOKIE = "bolao_heitor_session";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

type SessionPayload = {
  sid: string;
  uid: string;
  role: UserRole;
  token: string;
};

function getSessionSecret() {
  return new TextEncoder().encode(requireServerEnv("SESSION_SECRET"));
}

function normalizeIdentifier(input: string) {
  return input.replace(/\D/g, "");
}

function sameText(left: string | null | undefined, right: string) {
  return (left ?? "").trim().toLocaleLowerCase("pt-BR") === right.trim().toLocaleLowerCase("pt-BR");
}

function matchesRole(role: UserRole, allowed?: UserRole | UserRole[]) {
  if (!allowed) return true;
  return Array.isArray(allowed) ? allowed.includes(role) : role === allowed;
}

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 10);
}

export async function validatePin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash);
}

export async function authenticateUser(identifier: string, pin: string, role?: UserRole | UserRole[]) {
  const db = getDb();
  const phone = normalizeIdentifier(identifier);
  const trimmedIdentifier = identifier.trim();
  const orFilters: Prisma.UserWhereInput[] = [
    { name: trimmedIdentifier },
    { nickname: trimmedIdentifier },
  ];

  if (phone) {
    orFilters.unshift({ phone });
  }

  const candidates = await db.user.findMany({
    where: {
      OR: orFilters,
    },
    take: 10,
  });

  const user =
    candidates.find((candidate) => {
      return (
        matchesRole(candidate.role, role) &&
        ((phone && candidate.phone === phone) ||
          sameText(candidate.name, trimmedIdentifier) ||
          sameText(candidate.nickname, trimmedIdentifier))
      );
    }) ?? null;

  if (!user) {
    return { ok: false as const, error: "Usuário não encontrado." };
  }

  if (user.status !== UserStatus.ACTIVE) {
    return { ok: false as const, error: "Usuário inativo." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      ok: false as const,
      error: "Acesso temporariamente bloqueado por excesso de tentativas.",
    };
  }

  const isValidPin = await validatePin(pin, user.pinHash);

  if (!isValidPin) {
    const attempts = user.failedLoginAttempts + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts >= MAX_LOGIN_ATTEMPTS ? 0 : attempts,
        lockedUntil:
          attempts >= MAX_LOGIN_ATTEMPTS
            ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
            : null,
      },
    });

    return { ok: false as const, error: "PIN inválido." };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const rawToken = crypto.randomUUID();
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const session = await db.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const jwt = await new SignJWT({
    sid: session.id,
    uid: user.id,
    role: user.role,
    token: rawToken,
  } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { ok: true as const, user };
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const db = getDb();
    const session = await db.session.findUnique({
      where: { id: String(payload.sid) },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      cookieStore.delete(SESSION_COOKIE);
      return null;
    }

    const tokenMatches = await bcrypt.compare(String(payload.token), session.tokenHash);

    if (!tokenMatches || session.user.status !== UserStatus.ACTIVE) {
      cookieStore.delete(SESSION_COOKIE);
      return null;
    }

    await db.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return session;
  } catch {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
}

export async function requireUser(role?: UserRole | UserRole[]) {
  const session = await getCurrentSession();

  if (!session) {
    const adminRequested = Array.isArray(role)
      ? role.includes(UserRole.ADMIN) && role.length === 1
      : role === UserRole.ADMIN;
    redirect(adminRequested ? "/admin/entrar" : "/entrar");
  }

  if (role && !matchesRole(session.user.role, role)) {
    redirect(session.user.role === UserRole.ADMIN ? "/admin" : "/app");
  }

  return session;
}

export async function logout() {
  const session = await getCurrentSession();
  if (session) {
    await getDb().session.delete({ where: { id: session.id } }).catch(() => null);
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function logAudit(params: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}) {
  await getDb().auditLog.create({
    data: {
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue as never,
      newValue: params.newValue as never,
    },
  });
}

export const domainDefaults = {
  defaultPrizeMode(mode: PrizeMode) {
    if (mode === PrizeMode.TOP2) {
      return { first: 70, second: 30, third: 0 };
    }
    if (mode === PrizeMode.TOP3) {
      return { first: 60, second: 30, third: 10 };
    }
    return { first: 100, second: 0, third: 0 };
  },
  visiblePoolStatuses: [PoolStatus.OPEN, PoolStatus.CLOSED, PoolStatus.IN_PROGRESS],
  officialPaymentStatus: PaymentStatus.CONFIRMED,
  validWinners: [Winner.HOME, Winner.DRAW, Winner.AWAY],
};
