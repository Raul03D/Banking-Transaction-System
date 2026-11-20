import React, { useState } from 'react';
import { Send, X, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';

export default function TransferModal({
  accounts,
  balances,
  initialFromAccountId,
  onClose,
  onSubmit,
}) {
  const [fromAccountId, setFromAccountId] = useState(
    initialFromAccountId || (accounts[0] ? accounts[0]._id : '')
  );
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentBalance = balances[fromAccountId] || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!fromAccountId) {
      setError('Please select a sender account.');
      return;
    }
    if (!toAccountId.trim()) {
      setError('Please enter a destination account ID.');
      return;
    }
    if (fromAccountId === toAccountId.trim()) {
      setError('Source and Destination accounts cannot be the same.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (numAmount > currentBalance) {
      setError(
        `Insufficient funds. Current balance is ₹${currentBalance.toLocaleString(
          'en-IN'
        )}, but requested ₹${numAmount.toLocaleString('en-IN')}.`
      );
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        fromAccountId,
        toAccountId: toAccountId.trim(),
        amount: numAmount,
        idempotencyKey: idempotencyKey.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Send size={18} color="#3b82f6" />
            <span>Transfer Funds</span>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.825rem',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">From Account (Sender)</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="form-select"
              style={{ paddingLeft: '14px' }}
            >
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc._id.slice(0, 10)}... (Balance: ₹
                  {(balances[acc._id] || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">To Account ID (Recipient)</label>
            <div className="input-wrapper">
              <ArrowRight size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Paste recipient's Account ObjectId"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-help">Enter the 24-character destination account ID</div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Idempotency Key (Safety UUID)</label>
            <div className="input-wrapper">
              <KeyRound size={16} className="input-icon" />
              <input
                type="text"
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.775rem', fontFamily: 'monospace' }}
                required
              />
            </div>
            <div className="form-help">Prevents accidental double charges on retry</div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.5 }}
              disabled={loading}
            >
              <Send size={15} />
              <span>{loading ? 'Processing...' : 'Send Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
