import { toZonedTime } from "date-fns-tz";

export const WORLD_CUP_2026 = {
  code: "WC",
  name: "Copa do Mundo 2026",
  startDate: "2026-06-11",
  endDate: "2026-07-19",
};

const TZ = "America/Sao_Paulo";

export function getBrazilDateKey(value: Date | string) {
  const zoned = toZonedTime(value, TZ);
  const year = zoned.getFullYear();
  const month = String(zoned.getMonth() + 1).padStart(2, "0");
  const day = String(zoned.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isWorldCupDate(value: string) {
  return value >= WORLD_CUP_2026.startDate && value <= WORLD_CUP_2026.endDate;
}

export function getDefaultWorldCupDay() {
  const today = getBrazilDateKey(new Date());
  if (isWorldCupDate(today)) return today;
  return WORLD_CUP_2026.startDate;
}

export function normalizeWorldCupDay(day?: string) {
  if (day && isWorldCupDate(day)) return day;
  return getDefaultWorldCupDay();
}

export function normalizeWorldCupDateRange(dateFrom?: string, dateTo?: string) {
  const normalizedFrom = normalizeWorldCupDay(dateFrom);
  const normalizedTo = dateTo && isWorldCupDate(dateTo) ? dateTo : normalizedFrom;

  return {
    dateFrom: normalizedFrom,
    dateTo: normalizedTo < normalizedFrom ? normalizedFrom : normalizedTo,
  };
}

export function sameWorldCupDay(left: Date | string, right: Date | string) {
  return getBrazilDateKey(left) === getBrazilDateKey(right);
}
