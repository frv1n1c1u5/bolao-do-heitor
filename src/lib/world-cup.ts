export const WORLD_CUP_2026 = {
  code: "WC",
  name: "Copa do Mundo 2026",
  startDate: "2026-06-11",
  endDate: "2026-07-19",
};

export function normalizeWorldCupDateRange(dateFrom?: string, dateTo?: string) {
  return {
    dateFrom: dateFrom || WORLD_CUP_2026.startDate,
    dateTo: dateTo || dateFrom || WORLD_CUP_2026.endDate,
  };
}
