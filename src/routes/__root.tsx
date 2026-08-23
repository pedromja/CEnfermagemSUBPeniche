import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { APP_NAME, ORG_SHORT, SITE_FULL, SITE_SHORT } from "@/lib/report/paper";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${APP_NAME} · ${SITE_SHORT} · ${ORG_SHORT}` },
      {
        name: "description",
        content: `${APP_NAME} — ${ORG_SHORT}, ${SITE_FULL}. Relatório diário do coordenador de enfermagem, um separador por dia e Excel mensal.`,
      },
      { name: "theme-color", content: "#007a33" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="pt" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg text-ink">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Toaster
          position="top-right"
          offset={24}
          className="no-print"
          toastOptions={{
            classNames: {
              toast: "bg-surface text-ink border border-border font-sans",
            },
          }}
        />
        <Scripts />
      </body>
    </html>
  ),
});
