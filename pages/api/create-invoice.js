// pages/api/create-invoice.js

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or set to your domain like 'https://yourfrontend.vercel.app'
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Preflight request
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, tier_id, price_amount = 5 } = req.body;
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!apiKey || !baseUrl) {
    return res.status(500).json({ error: 'Missing environment variables.' });
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
        success_url: `${baseUrl}/payment-success?user_id=${user_id}&tier_id=${tier_id}`,
        cancel_url: `${baseUrl}/payment-cancelled`,
      }),
    });

    const data = await invoiceRes.json();

    if (!invoiceRes.ok) {
      return res.status(500).json({ error: data });
    }

    return res.status(200).json({ invoice_url: data.invoice_url });
  } catch (err) {
    console.error("❌ Error creating invoice:", err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
