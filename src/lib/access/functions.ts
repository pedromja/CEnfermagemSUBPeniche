import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const getAccessState = createServerFn({ method: "GET" }).handler(
  async () => {
    const { readAccessState } = await import("./server");
    return readAccessState();
  },
);

export const getSetupNeeded = createServerFn({ method: "GET" }).handler(
  async () => {
    const { adminExists } = await import("./server");
    return { setupNeeded: !(await adminExists()) };
  },
);

export const saveAccessPolicy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { allowedIps: string }) => input)
  .handler(async ({ context, data }) => {
    const { saveAllowedIps, readAccessState } = await import("./server");
    await saveAllowedIps({
      userId: context.userId,
      allowedIps: data.allowedIps,
    });
    return readAccessState();
  });

export const signInGuest = createServerFn({ method: "POST" })
  .validator((input: { username: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { verifyGuestLogin, writeGuestSession } = await import("./guest.server");
    if (!verifyGuestLogin(data.username, data.password)) {
      throw new Error("Utilizador ou palavra-passe incorrectos.");
    }
    writeGuestSession();
    const { readAccessState } = await import("./server");
    return readAccessState();
  });

export const signOutGuest = createServerFn({ method: "POST" }).handler(
  async () => {
    const { clearGuestSession } = await import("./guest.server");
    clearGuestSession();
    return { ok: true as const };
  },
);

