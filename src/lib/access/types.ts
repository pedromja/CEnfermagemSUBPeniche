export type AccessState = {
  setupNeeded: boolean;
  granted: boolean;
  reason: "ok" | "setup" | "ip" | "unset";
  clientIp: string;
  clientIps: string[];
  preview: boolean;
  allowedIps: string;
  isAdmin: boolean;
  isGuest: boolean;
  guestEnabled: boolean;
};
