import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === "production";
const distRoot = path.join(root, "dist");
const publicRoot = production && existsSync(path.join(distRoot, "index.html"))
  ? distRoot
  : path.join(root, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  const origin = `http://${req.headers.host || "localhost"}`;
  let pathname;

  try {
    pathname = decodeURIComponent(new URL(req.url || "/", origin).pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(requestedPath).replace(/^([/\\\\])+/, "");
  const filePath = path.resolve(publicRoot, normalized);

  if (filePath !== publicRoot && !filePath.startsWith(publicRoot + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    });
    res.end(body);
  } catch (error) {
    if (error?.code === "ENOENT" && !path.extname(pathname)) {
      try {
        const body = await readFile(path.join(publicRoot, "index.html"));
        res.writeHead(200, {
          "Content-Type": mimeTypes[".html"],
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        });
        res.end(body);
        return;
      } catch {
        // Fall through to 404 below.
      }
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`MQSI site listening on port ${port}`);
});
