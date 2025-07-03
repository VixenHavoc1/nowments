 import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const router = useRouter();
  const { user_id, tier_id } = router.query;

  useEffect(() => {
    const checkPayment = async () => {
      const res = await fetch(`https://api.nowpayments.io/v1/payment-status?payment_id=${router.query.payment_id}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_NOWPAYMENTS_API_KEY, // Temporarily OK for client use if needed
        },
      });

      const data = await res.json();
      if (data.payment_status === 'finished') {
        // Call your HuggingFace backend to grant access
        await fetch(`https://your-hf-backend/activate-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id, tier_id }),
        });
      }
    };

    if (router.isReady) checkPayment();
  }, [router]);

  return <div>Payment successful! You will be redirected shortly.</div>;
}
