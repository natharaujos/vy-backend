import type { VercelRequest, VercelResponse } from "@vercel/node";
import enableCors from "../../shared/enableCors";
import { createPayment } from "../../services/paymentService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (enableCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    console.log("Creating payment with data:", req.body);
    const result = await createPayment(req.body);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error(err.response?.data || err.message || err);
    return res.status(500).json({ error: "Erro ao criar pagamento" });
  }
}
