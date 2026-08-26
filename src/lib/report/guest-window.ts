export function lisbonIsoToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function addIsoDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function guestCanView(iso: string, today = lisbonIsoToday()): boolean {
  return iso >= addIsoDays(today, -3) && iso <= addIsoDays(today, 1);
}

export function guestCanFill(iso: string, today = lisbonIsoToday()): boolean {
  return iso === today || iso === addIsoDays(today, 1);
}
