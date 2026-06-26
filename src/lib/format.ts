import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

const TZ = "America/Sao_Paulo";

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function formatDateTime(value: Date | string) {
  return format(toZonedTime(value, TZ), "dd/MM/yyyy '-s' HH:mm", { locale: ptBR });
}

export function formatDate(value: Date | string) {
  return format(toZonedTime(value, TZ), "dd/MM/yyyy", { locale: ptBR });
}

export function formatTime(value: Date | string) {
  return format(toZonedTime(value, TZ), "HH:mm", { locale: ptBR });
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}
