import { VercelRequest, VercelResponse } from "@vercel/node";

export default function enableCors(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  const allowedOrigins = [
    "https://vitoriayuri-casamento.web.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];

  console.log("Request Origin:", req.headers.origin);

  const origin = (req.headers.origin || "").toLowerCase();

  if (allowedOrigins.some((o) => o.toLowerCase() === origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true; // Preflight handled
  }

  return false; // Continue with main handler
}
