import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../../lib/firebase-admin";
import axios from "axios";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id, topic } = req.query;

    console.log("Webhook received:", req.query);

    if (topic !== "payment") return res.status(200).send("ignored");

    // 1. busca detalhes do pagamento no MP
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${id}`,
      {
        headers: { Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` },
      }
    );

    const payment = response.data;

    console.log("MP payment details", response.data);

    const externalRef = payment.external_reference;

    // 2. atualiza Firestore
    await db.collection("payments").doc(externalRef).update({
      status: payment.status,
      mpPaymentId: payment.id,
      updatedAt: new Date(),
    });

    // 3. se aprovado → marca presente como comprado
    if (payment.status === "approved") {
      const doc = await db.collection("payments").doc(externalRef).get();
      const data = doc.data();
      if (data?.giftId) {
        await db
          .collection("gifts")
          .doc(data.giftId)
          .update({
            buyedBy: data.buyerEmail || "anonymous",
          });
      }
    }

    return res.status(200).send("ok");
  } catch (err: any) {
    console.error("Webhook error:", err.response?.data || err.message);
    return res.status(500).send("error");
  }
}
