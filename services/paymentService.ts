import axios from "axios";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

export async function createPayment(data: any) {
  const response = await axios.post(
    "https://api.mercadopago.com/checkout/preferences",
    {
      external_reference: data.external_reference,
      items: data.items,
      payer: data.payer,
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
      },
      back_urls: {
        success: `https://maguinhatuquinho.web.app/payment/${data.external_reference}`,
        failure: `https://maguinhatuquinho.web.app/payment/${data.external_reference}`,
        pending: `https://maguinhatuquinho.web.app/payment/${data.external_reference}`,
      },
      auto_return: "all",
      notification_url: `${process.env.API_BASE_URL}/api/payments/webhook`,
    },
    {
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  // Retorna só dados úteis pro front
  const { point_of_interaction, init_point } = response.data;
  return {
    qr_code: point_of_interaction?.transaction_data?.qr_code ?? null,
    qr_code_base64:
      point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
    init_point,
  };
}
