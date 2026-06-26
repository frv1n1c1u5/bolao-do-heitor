import "server-only";

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY,
  SESSION_SECRET: process.env.SESSION_SECRET ?? "",
  NEXT_PUBLIC_APP_NAME:
    process.env.NEXT_PUBLIC_APP_NAME ?? "Bolao do Heitor",
  FOOTBALL_DATA_BASE_URL: "https://api.football-data.org/v4",
};

export function requireServerEnv(key: "DATABASE_URL" | "SESSION_SECRET") {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
