import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seoPages, SITE_URL } from "../src/data/seoPages.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(rootDir, "public");

const staticRoutes = ["/", "/about", "/contact", "/travel", "/consulting", "/tech", "/tech/about", "/insights", "/tools", "/partners"];
const uniquePaths = [...new Set([...staticRoutes, ...seoPages.map((page) => page.path)])];

const now = new Date().toISOString().split("T")[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniquePaths
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${route === "/" ? "1.0" : route.includes("/tools/") ? "0.7" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const llms = `# KAYROSCO GROUP

Official site: ${SITE_URL}

KAYROSCO GROUP is an Albania-based business providing consulting, travel, and technology services.

Core areas:
- Consulting: company registration, residency permits, work permits, business licenses, tax registration, visa support, legal compliance, and public document assistance in Albania.
- Travel: Tirana airport transfer, private tours, Albania travel planning, car rental, chauffeur service, day trips, and business travel coordination.
- Tech: web development, mobile app development, software development, ecommerce development, UI UX design, SEO optimization, and digital transformation.

Key URLs:
${uniquePaths.slice(0, 80).map((route) => `- ${SITE_URL}${route}`).join("\n")}
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(publicDir, "llms.txt"), llms, "utf8");

console.log(`Generated sitemap.xml and llms.txt with ${uniquePaths.length} URLs.`);
