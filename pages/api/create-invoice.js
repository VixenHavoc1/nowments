 // pages/api/create-invoice.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { price_amount, user_id, tier_id } = req.body;

  const apiKey = process.env.NOWPAYMENTS_API_KEY;

  try {
    const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
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
    if (!invoiceRes.ok) return res.status(500).json({ error: data });

    return res.status(200).json({ invoice_url: data.invoice_url });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
