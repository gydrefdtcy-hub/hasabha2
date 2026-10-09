import { mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDirectory = path.join(projectRoot, "public");
const siteUrlValue = (
  process.env.PUBLIC_SITE_URL ??
  process.env.VITE_PUBLIC_SITE_URL ??
  ""
).trim();

const publicRoutes = [
  { path: "/", priority: "1.0" },
  { path: "/percentage", priority: "0.9" },
  { path: "/age", priority: "0.9" },
  { path: "/discount", priority: "0.9" },
  { path: "/privacy", priority: "0.3" },
  { path: "/contact", priority: "0.3" },
];

await mkdir(publicDirectory, { recursive: true });

let sitemapUrl;
if (siteUrlValue) {
  const parsedUrl = new URL(siteUrlValue);
  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.pathname !== "/" ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error(
      "PUBLIC_SITE_URL must be an http(s) origin with no path, query, or credentials.",
    );
  }

  const origin = parsedUrl.origin;
  sitemapUrl = `${origin}/sitemap.xml`;
  const entries = publicRoutes
    .map(
      ({ path: routePath, priority }) =>
        `  <url><loc>${origin}${routePath}</loc><priority>${priority}</priority></url>`,
    )
    .join("\n");
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</urlset>",
    "",
  ].join("\n");
  await writeFile(path.join(publicDirectory, "sitemap.xml"), sitemap);
} else {
  await rm(path.join(publicDirectory, "sitemap.xml"), { force: true });
}

const robots = [
  "User-agent: *",
  "Allow: /",
  ...(sitemapUrl ? [`Sitemap: ${sitemapUrl}`] : []),
  "",
].join("\n");
await writeFile(path.join(publicDirectory, "robots.txt"), robots);
