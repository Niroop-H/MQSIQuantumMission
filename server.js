import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const prodRoot = path.join(root, "dist");
const publicRoot = process.env.NODE_ENV === "production" && existsSync(prodRoot) ? prodRoot : path.join(root, "public");
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
  let safePath = path.normalize(urlPath).replace(/^([.][.][/\\])+/, "");
  if (safePath === path.sep || safePath === ".") safePath = "/index.html";
  const target = path.join(publicRoot, safePath);
  try {
    if (!target.startsWith(publicRoot)) throw new Error("Invalid path");
    const data = await readFile(target);
    res.writeHead(200, { "Content-Type": mime[path.extname(target)] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" });
    res.end(data);
  } catch {
    // A one-page site uses index.html as a graceful fallback for unknown paths.
    try {
      const data = await readFile(path.join(publicRoot, "index.html"));
      res.writeHead(200, { "Content-Type": mime[".html"], "X-Content-Type-Options": "nosniff" });
      res.end(data);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Build the site first with npm run build.");
    }
  }
});
server.listen(port, "0.0.0.0", () => console.log(`MQSI site listening on http://localhost:${port}`));
