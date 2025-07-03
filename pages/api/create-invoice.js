// pages/api/create-invoice.js

export default async function handler(req, res) {

 res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method !== 'POST') {
    console.error('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { price_amount = 5, user_id, tier_id } = req.body;

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!apiKey || !baseUrl) {
    console.error('❌ Missing NOWPAYMENTS_API_KEY or NEXT_PUBLIC_BASE_URL in env');
    return res.status(500).json({ error: 'Missing config' });
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
      console.error('❌ Invoice creation failed:', data);
      return res.status(500).json({ error: 'NowPayments invoice error', detail: data });
    }

    console.log('✅ Invoice created:', data.invoice_url);
    return res.status(200).json({ payment_link: data.invoice_url });
  } catch (err) {
    console.error('❌ Invoice error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
