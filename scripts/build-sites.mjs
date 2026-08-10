import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const root = process.cwd();
const publicDir = path.join(root, "public");
const deployDir = path.join(root, "deploy");
const distDir = path.join(root, "dist");
const serverDir = path.join(distDir, "server");
const execFileAsync = promisify(execFile);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

async function readPublicAssets(dir, prefix = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const assets = [];
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    const routePath = `${prefix}/${entry.name}`.replace(/\/+/g, "/");
    if (entry.isDirectory()) {
      assets.push(...await readPublicAssets(absolutePath, routePath));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    const bytes = await fs.readFile(absolutePath);
    assets.push({
      path: routePath,
      contentType: contentTypes[ext] || "application/octet-stream",
      body: bytes.toString("base64"),
      encoding: "base64",
    });
  }
  return assets;
}

function displayedDiscountValue(discount) {
  return Math.round(Number(discount) * 100) / 100;
}

function hasAbnormalPrice(find) {
  const sale = Number(find.salePrice);
  const original = Number(find.originalPrice);
  const discount = Number(find.discount);
  if (!Number.isFinite(sale) || !Number.isFinite(original) || !Number.isFinite(discount)) return true;
  if (sale <= 0 || original <= 0 || original <= sale) return true;

  const ratio = original / sale;
  return original >= 5000
    || ratio >= 50
    || (original >= 1000 && ratio >= 20)
    || (original >= 500 && displayedDiscountValue(discount) >= 0.95);
}

function sanitizeSnapshot(snapshot) {
  const finds = (snapshot.finds || []).filter((find) => !hasAbnormalPrice(find));
  const removed = (snapshot.finds || []).length - finds.length;
  return {
    ...snapshot,
    finds,
    count: finds.length,
    report: snapshot.report ? { ...snapshot.report, finds: finds.length } : snapshot.report,
    removedAbnormalPrices: removed,
  };
}

await execFileAsync("node", ["server.mjs", "--write-snapshot"], {
  cwd: root,
  env: {
    ...process.env,
    BUILD_MIN_DISCOUNT: "0.4",
    BUILD_FORCE_REFRESH: process.env.BUILD_FORCE_REFRESH || "0",
    BUILD_REFRESH_MODE: process.env.BUILD_REFRESH_MODE || "quick",
  },
});

const snapshot = sanitizeSnapshot(JSON.parse(await fs.readFile(path.join(deployDir, "snapshot.json"), "utf8")));
const assets = await readPublicAssets(publicDir);
const htmlAsset = assets.find((asset) => asset.path === "/index.html");
if (htmlAsset) assets.push({ ...htmlAsset, path: "/" });

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(serverDir, { recursive: true });

const worker = `const snapshot = ${JSON.stringify(snapshot)};
const assets = new Map(${JSON.stringify(assets)}.map((asset) => [asset.path, asset]));

function assetResponse(asset) {
  const bytes = Uint8Array.from(atob(asset.body), (char) => char.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      "content-type": asset.contentType,
      "cache-control": asset.path === "/" || asset.path.endsWith(".html")
        ? "no-store"
        : "public, max-age=300",
    },
  });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function ndjsonResponse(events) {
  const body = events.map((event) => JSON.stringify(event)).join("\\n") + "\\n";
  return new Response(body, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

async function imageProxyResponse(url) {
  try {
    const src = url.searchParams.get("src") || "";
    if (!src) return new Response("Missing image src", { status: 400 });
    const target = new URL(src);
    if (!["http:", "https:"].includes(target.protocol)) {
      return new Response("Unsupported image protocol", { status: 400 });
    }

    const response = await fetch(target, {
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    if (!response.ok) return new Response("Could not fetch image", { status: response.status || 502 });
    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return new Response("Image proxy received non-image content", { status: 502 });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Could not fetch image", { status: 502 });
  }
}

function adminAllowed(request, env) {
  const expected = env?.ADMIN_REFRESH_TOKEN || "";
  const provided = request.headers.get("x-admin-refresh-token") || "";
  if (!expected) return Boolean(provided);
  return provided === expected;
}

async function readJsonRequest(request, limit = 24000) {
  const text = await request.text();
  if (text.length > limit) throw new Error("Request body too large");
  if (!text.trim()) return {};
  return JSON.parse(text);
}

function sanitizeClickEvent(payload = {}, request = null) {
  const filters = payload.filters && typeof payload.filters === "object" ? payload.filters : {};
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : \`\${Date.now()}-\${Math.random().toString(36).slice(2, 10)}\`,
    createdAt: new Date().toISOString(),
    eventType: String(payload.eventType || "click").slice(0, 80),
    source: String(payload.source || "").slice(0, 120),
    brand: String(payload.brand || "").slice(0, 120),
    title: String(payload.title || "").slice(0, 240),
    productUrl: String(payload.productUrl || payload.url || "").slice(0, 1000),
    salePrice: Number.isFinite(Number(payload.salePrice)) ? Number(payload.salePrice) : null,
    discount: Number.isFinite(Number(payload.discount)) ? Number(payload.discount) : null,
    filtersJson: JSON.stringify(filters).slice(0, 4000),
    pageUrl: String(payload.pageUrl || "").slice(0, 1000),
    referrer: String(request?.headers?.get("referer") || "").slice(0, 1000),
    userAgent: String(request?.headers?.get("user-agent") || "").slice(0, 500),
  };
}

async function ensureClickSchema(env) {
  if (!env.DB) return false;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS click_events (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, event_type TEXT NOT NULL, source TEXT, brand TEXT, title TEXT, product_url TEXT, sale_price REAL, discount REAL, filters_json TEXT, page_url TEXT, referrer TEXT, user_agent TEXT)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS click_events_created_at_idx ON click_events (created_at)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS click_events_source_idx ON click_events (source)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS click_events_brand_idx ON click_events (brand)"),
  ]);
  return true;
}

async function saveClickEvent(env, event) {
  const ready = await ensureClickSchema(env);
  if (!ready) return false;
  await env.DB.prepare("INSERT INTO click_events (id, created_at, event_type, source, brand, title, product_url, sale_price, discount, filters_json, page_url, referrer, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(event.id, event.createdAt, event.eventType, event.source, event.brand, event.title, event.productUrl, event.salePrice, event.discount, event.filtersJson, event.pageUrl, event.referrer, event.userAgent)
    .run();
  return true;
}

async function clickReport(env) {
  const ready = await ensureClickSchema(env);
  if (!ready) return {
    total: 0,
    today: 0,
    last7Days: 0,
    topStores: [],
    topBrands: [],
    topProducts: [],
    recent: [],
    storage: "unavailable",
  };
  const todayKey = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [total, today, last7Days, topStores, topBrands, topProducts, recent] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM click_events").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM click_events WHERE created_at >= ?").bind(\`\${todayKey}T00:00:00.000Z\`).first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM click_events WHERE created_at >= ?").bind(sevenDaysAgo).first(),
    env.DB.prepare("SELECT source AS label, COUNT(*) AS count FROM click_events WHERE source IS NOT NULL AND source != '' GROUP BY source ORDER BY count DESC, source ASC LIMIT 8").all(),
    env.DB.prepare("SELECT brand AS label, COUNT(*) AS count FROM click_events WHERE brand IS NOT NULL AND brand != '' GROUP BY brand ORDER BY count DESC, brand ASC LIMIT 8").all(),
    env.DB.prepare("SELECT title AS label, COUNT(*) AS count FROM click_events WHERE title IS NOT NULL AND title != '' GROUP BY title ORDER BY count DESC, title ASC LIMIT 8").all(),
    env.DB.prepare("SELECT created_at, event_type, source, brand, title FROM click_events ORDER BY created_at DESC LIMIT 20").all(),
  ]);
  return {
    total: total?.count || 0,
    today: today?.count || 0,
    last7Days: last7Days?.count || 0,
    topStores: topStores?.results || [],
    topBrands: topBrands?.results || [],
    topProducts: topProducts?.results || [],
    recent: (recent?.results || []).map((row) => ({
      createdAt: row.created_at,
      eventType: row.event_type,
      source: row.source,
      brand: row.brand,
      title: row.title,
    })),
    storage: "d1",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/clicks") {
      if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
      try {
        const payload = await readJsonRequest(request);
        const event = sanitizeClickEvent(payload, request);
        const saved = await saveClickEvent(env || {}, event);
        return saved ? new Response(null, { status: 204, headers: { "cache-control": "no-store" } }) : jsonResponse({ error: "Click storage is not configured." }, 503);
      } catch (error) {
        return jsonResponse({ error: error.message }, 400);
      }
    }

    if (url.pathname === "/api/click-report") {
      if (!adminAllowed(request, env || {})) {
        return jsonResponse({ error: "Admin unlock required." }, 401);
      }
      try {
        return jsonResponse(await clickReport(env || {}));
      } catch (error) {
        return jsonResponse({ error: error.message }, 500);
      }
    }

    if (url.pathname === "/api/image-proxy") {
      return imageProxyResponse(url);
    }

    if (url.pathname === "/api/finds") {
      if (url.searchParams.get("refresh") === "1") {
        return jsonResponse({ error: "Online refresh is not enabled yet. Refresh locally and redeploy the latest snapshot." }, 501);
      }
      return jsonResponse(snapshot);
    }

    if (url.pathname === "/api/finds/stream") {
      if (url.searchParams.get("refresh") === "1") {
        return ndjsonResponse([{ type: "fatal", error: "Online refresh is not enabled yet. Refresh locally and redeploy the latest snapshot." }]);
      }
      return ndjsonResponse([{ type: "cache", data: snapshot }]);
    }

    const normalizedPath = url.pathname.endsWith("/") && url.pathname !== "/"
      ? url.pathname.slice(0, -1)
      : url.pathname;
    const asset = assets.get(normalizedPath) || assets.get("/index.html");
    return asset ? assetResponse(asset) : new Response("Not found", { status: 404 });
  },
};
`;

await fs.writeFile(path.join(serverDir, "index.js"), worker);
console.log(`Built deployable site with ${snapshot.finds?.length || 0} finds.`);
