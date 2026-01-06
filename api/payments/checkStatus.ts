import axios from "axios";
import enableCors from "../../shared/enableCors";
import { VercelRequest, VercelResponse } from "@vercel/node";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

export const config = {
  api: {
    bodyParser: true,
    methods: ["GET", "OPTIONS"],
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const preflightHandled = enableCors(req, res);
  if (preflightHandled) {
    // OPTIONS request ended here, just return early
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const paymentId = req.query.paymentId;

  if (!paymentId || typeof paymentId !== "string") {
    res
      .status(400)
      .json({ error: "paymentId é obrigatório e deve ser string" });
    return;
  }

  try {
    console.log(`Checking payment status for ID: ${paymentId}`); // Add this
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    console.log(`Payment status response: ${JSON.stringify(response.data)}`);
    res.status(200).json(response.data.status);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao consultar pagamento" });
  }
}
