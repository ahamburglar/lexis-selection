import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const deployDir = path.join(root, "deploy");
const distDir = path.join(root, "dist");
const serverDir = path.join(distDir, "server");

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

const snapshot = JSON.parse(await fs.readFile(path.join(deployDir, "snapshot.json"), "utf8"));
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

export default {
  async fetch(request) {
    const url = new URL(request.url);

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
