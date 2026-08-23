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
