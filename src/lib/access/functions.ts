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
  .validator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    const { verifyGuestPassword, writeGuestSession, guestPasswordIsSet } =
      await import("./guest.server");
    if (!(await guestPasswordIsSet())) {
      throw new Error("A conta de equipa ainda não foi definida pelo administrador.");
    }
    if (!(await verifyGuestPassword(data.password))) {
      throw new Error("Palavra-passe incorrecta.");
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

export const saveGuestPassword = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    const { saveGuestPassword: save } = await import("./guest.server");
    await save(data.password);
    const { readAccessState } = await import("./server");
    return readAccessState();
  });
