import axios from "axios";
import enableCors from "../../shared/enableCors";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const preflightHandled = enableCors(req, res);
  if (preflightHandled) {
    // OPTIONS request ended here, just return early
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const {
    token,
    transactionAmount,
    description,
    installments,
    paymentMethodId,
    payer,
  } = req.body;

  try {
    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
        token,
        transaction_amount: Number(transactionAmount),
        description,
        installments,
        payment_method_id: paymentMethodId,
        payer,
      },
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    res.status(500).json({ error: "Erro ao processar pagamento" });
  }
}
