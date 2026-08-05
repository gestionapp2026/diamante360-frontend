import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "-";
  return currencyFormatter.format(num);
}

export function formatNumber(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "-";
  return numberFormatter.format(num);
}

export function formatDate(value: string | Date | null | undefined, pattern = "dd/MM/yyyy"): string {
  if (!value) return "-";
  try {
    return format(new Date(value), pattern, { locale: es });
  } catch {
    return "-";
  }
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "dd/MM/yyyy HH:mm");
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return "-";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: es });
  } catch {
    return "-";
  }
}
