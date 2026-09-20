export function formatBRL(value: number, digits = 2): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(2).replace(".", ",")}%`;
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `Há ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.round(hours / 24);
  return `Há ${days} dia${days > 1 ? "s" : ""}`;
}
