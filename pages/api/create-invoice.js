export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*'); // or restrict to frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { price_amount, user_id, tier_id } = req.body;
  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  if (!apiKey || !price_amount || !user_id || !tier_id) {
    console.error("Missing required values:", { apiKey, price_amount, user_id, tier_id });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const invoiceRes = await fetch('https://sandbox.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount,
        price_currency: 'usd',
        order_id: `${user_id}_${tier_id}`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?user_id=${user_id}&tier_id=${tier_id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancelled`,
      }),
    });

    const data = await invoiceRes.json();

    if (!invoiceRes.ok) {
      console.error("NOWPayments API Error:", data);
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ payment_link: data.invoice_url });
  } catch (err) {
    console.error("Internal server error:", err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
