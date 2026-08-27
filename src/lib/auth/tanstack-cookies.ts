import { setCookie } from "@tanstack/react-start/server";
import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";
import { createAuthMiddleware } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";

/**
 * Same job as better-auth's tanstackStartCookies, but with a static import.
 * Dynamic `import("@tanstack/react-start/server")` is undefined on the
 * Cloudflare Worker (--no-bundle additional modules) and crashes the page
 * with "Cannot destructure property 'setCookie'".
 */
export function tanstackStartCookiesStatic(): BetterAuthPlugin {
  return {
    id: "tanstack-start-cookies",
    hooks: {
      after: [
        {
          matcher() {
            return true;
          },
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.responseHeaders;
            if ("_flag" in ctx && ctx._flag === "router") return;
            if (!(returned instanceof Headers)) return;
            const setCookies = returned.get("set-cookie");
            if (!setCookies) return;
            const parsed = parseSetCookieHeader(setCookies);
            parsed.forEach((value, key) => {
              if (!key) return;
              try {
                setCookie(key, value.value, toCookieOptions(value));
              } catch {
                /* cookie already committed */
              }
            });
          }),
        },
      ],
    },
  };
}
