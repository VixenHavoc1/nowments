 export default async function handler(req, res) {
  const { payment_id } = req.query;

  try {
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${payment_id}`, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
      },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
}
