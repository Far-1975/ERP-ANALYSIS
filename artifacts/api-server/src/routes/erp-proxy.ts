import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import http from "http";

const router: IRouter = Router();
const FLASK_PORT = process.env["FLASK_PORT"] ?? "5000";

function proxyToFlask(req: Request, res: Response): void {
  const body = req.method !== "GET" && req.method !== "HEAD"
    ? JSON.stringify(req.body)
    : undefined;

  const options: http.RequestOptions = {
    hostname: "127.0.0.1",
    port: Number(FLASK_PORT),
    path: `/api/erp${req.path}`,
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
    },
  };

  // For SSE streaming
  if (req.headers.accept === "text/event-stream") {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const proxyReq = http.request(options, (proxyRes) => {
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", (err) => {
      const errorEvent = JSON.stringify({ type: "error", message: err.message });
      res.write(`data: ${errorEvent}\n\n`);
      res.end();
    });

    if (body) proxyReq.write(body);
    proxyReq.end();
    return;
  }

  // Regular JSON proxy
  const chunks: Buffer[] = [];
  const proxyReq = http.request(options, (proxyRes) => {
    proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));
    proxyRes.on("end", () => {
      const raw = Buffer.concat(chunks).toString();
      const status = proxyRes.statusCode ?? 500;
      res.status(status);
      res.setHeader("Content-Type", "application/json");
      res.send(raw);
    });
  });

  proxyReq.on("error", () => {
    res.status(502).json({ error: "Flask backend unavailable" });
  });

  if (body) proxyReq.write(body);
  proxyReq.end();
}

router.get("/{*splat}", (req, res): void => {
  proxyToFlask(req, res);
});

router.post("/{*splat}", (req, res): void => {
  proxyToFlask(req, res);
});

export default router;
