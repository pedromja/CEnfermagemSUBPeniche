/**
 * After a Netlify production build, drop platform preview static paths from
 * the published folder so they are not part of the public site.
 */
import { rmSync } from "node:fs";

if (!process.env.NETLIFY) process.exit(0);

rmSync("dist/__grok", { recursive: true, force: true });
