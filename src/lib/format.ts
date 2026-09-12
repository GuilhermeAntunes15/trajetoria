const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const monthYearFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date));
}

export function formatLongDate(date: Date | string): string {
  return longDateFormatter.format(new Date(date));
}

export function formatMonthYear(date: Date | string): string {
  return monthYearFormatter.format(new Date(date));
}

export function formatDateRange(start: Date | string, end?: Date | string | null): string {
  if (!end) return formatDate(start);
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) return formatDate(startDate);
  return `${formatDate(startDate)} a ${formatDate(endDate)}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]![0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts[0] ?? name;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

const relativeFormatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function formatRelative(date: Date | string): string {
  const target = new Date(date);
  const diffMs = target.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 60) return relativeFormatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeFormatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return relativeFormatter.format(diffDays, "day");

  return formatDate(target);
}
