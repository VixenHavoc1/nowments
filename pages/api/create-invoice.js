// pages/api/create-invoice.js

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // CORS preflight support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.warn('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const { price_amount, user_id, tier_id } = req.body;

  if (!price_amount || !user_id || !tier_id) {
    console.error('Missing required fields:', { price_amount, user_id, tier_id });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!apiKey || !baseUrl) {
    console.error('Missing environment variables:', { apiKey, baseUrl });
    return res.status(500).json({ error: 'Missing environment variables' });
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
      console.error('NOWPayments API error:', {
        status: invoiceRes.status,
        statusText: invoiceRes.statusText,
        response: data,
      });
      return res.status(500).json({ error: data });
    }

    console.log('Invoice created successfully:', data);
    return res.status(200).json({ invoice_url: data.invoice_url });

  } catch (err) {
    console.error('Unexpected error creating invoice:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
