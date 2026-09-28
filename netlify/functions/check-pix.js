// Netlify Serverless Function: Consulta de Status do Pix no Mercado Pago
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "APP_USR-2777256007756678-020610-bc738d3ef288fca864aee141ca951699-1369429207";

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  const paymentId = event.queryStringParameters?.id;

  if (!paymentId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Parâmetro 'id' do pagamento é obrigatório" })
    };
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: "Erro ao consultar pagamento", details: data })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: data.id,
        status: data.status, // "pending", "approved", "rejected", etc.
        status_detail: data.status_detail,
        date_approved: data.date_approved
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
