 export default function PaywallModal({ onClose }) {
  const handlePay = async (tierId, amount) => {
    const userId = localStorage.getItem('user_id');
    const res = await fetch('/api/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, tier_id: tierId, price_amount: amount }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = data.invoice_url;
    } else {
      alert('Invoice creation failed');
      console.error(data.error);
    }
  };

  return (
    <div className="modal">
      <h2>Choose a Tier</h2>
      <button onClick={() => handlePay('tier1', 5)}>Tier 1 – $5</button>
      <button onClick={() => handlePay('tier2', 10)}>Tier 2 – $10</button>
        <button onClick={() => handlePay('tier1', 5)}>Tier 3 – $20</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
