export const INVITED_ADMINS: { email: string; name: string }[] = [
  { email: "anabelavala@ulso.min-saude.pt", name: "Anabela Vala" },
];

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function invitedAdmin(email: string): { email: string; name: string } | undefined {
  const key = normalizeAdminEmail(email);
  return INVITED_ADMINS.find((row) => row.email === key);
}

export function isInvitedAdminEmail(email: string): boolean {
  return Boolean(invitedAdmin(email));
}
