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
    BUILD_MIN_DISCOUNT: "0.7",
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

    return new Response(response.body, {
      status: 200,
      headers: {
        "content-type": response.headers.get("content-type") || "image/jpeg",
        "cache-control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Could not fetch image", { status: 502 });
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

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
