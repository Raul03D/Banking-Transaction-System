import React, { useState } from 'react';
import { ShieldAlert, X, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';

export default function InitialFundsModal({ onClose, onSubmit }) {
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('10000');
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!toAccountId.trim()) {
      setError('Please enter a target account ID.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        toAccountId: toAccountId.trim(),
        amount: numAmount,
        idempotencyKey: idempotencyKey.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'System initial funds transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <ShieldAlert size={18} color="#f59e0b" />
            <span>Deposit Initial Funds (System)</span>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#fbbf24',
              marginBottom: '18px',
              lineHeight: '1.4',
            }}
          >
            <strong>System Admin Notice:</strong> This operation dispenses initial funds from the system reserve directly into the recipient's account.
          </div>

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
            <label className="form-label">Recipient Account ID</label>
            <div className="input-wrapper">
              <ArrowRight size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Target Account ObjectId"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-help">The account to receive newly minted funds</div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Amount (₹)</label>
            <div className="input-wrapper">
              <span className="input-icon" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Idempotency Key</label>
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
              className="btn btn-warning"
              style={{ flex: 1.5 }}
              disabled={loading}
            >
              <ShieldAlert size={15} />
              <span>{loading ? 'Minting...' : 'Inject Funds'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
