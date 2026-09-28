// Netlify Serverless Function: Criação de Pagamento Pix no Mercado Pago
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "APP_USR-2777256007756678-020610-bc738d3ef288fca864aee141ca951699-1369429207";

exports.handler = async function(event, context) {
  // Configuração de CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método não permitido" }) };
  }

  try {
    let body = {};
    if (event.body) {
      try { body = JSON.parse(event.body); } catch(e) {}
    }

    const payerEmail = body.email || "pagamento.cliente@validacnab.com.br";
    const idempotencyKey = "cnab_" + Date.now() + "_" + Math.random().toString(36).substring(7);

    const payload = {
      transaction_amount: 29.90,
      description: "ValidaCNAB - Correção e Validação de Arquivo FEBRABAN",
      payment_method_id: "pix",
      payer: {
        email: payerEmail,
        first_name: "Cliente",
        last_name: "CNAB"
      }
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: "Erro ao gerar Pix no Mercado Pago", details: data })
      };
    }

    const transactionData = data.point_of_interaction?.transaction_data;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        payment_id: data.id,
        status: data.status,
        qr_code: transactionData?.qr_code,
        qr_code_base64: transactionData?.qr_code_base64,
        ticket_url: transactionData?.ticket_url
      })
    };

  } catch (error) {
    console.error("Erro interno:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
