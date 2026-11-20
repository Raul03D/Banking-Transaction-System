import React, { useState } from 'react';
import { CreditCard, Copy, Check, RefreshCw, Send } from 'lucide-react';

export default function AccountCard({ account, balance, onRefreshBalance, onInitiateTransfer }) {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(account._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshBalance(account._id);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <div className="account-card">
      <div>
        <div className="acc-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#60a5fa" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
              Standard Account
            </span>
          </div>
          <span className={`acc-status-badge ${account.status || 'ACTIVE'}`}>
            {account.status || 'ACTIVE'}
          </span>
        </div>

        <div className="acc-balance-section">
          <div className="balance-label">Available Balance</div>
          <div className="balance-amount">
            <span style={{ color: '#10b981' }}>₹</span>
            <span>{typeof balance === 'number' ? balance.toLocaleString('en-IN') : '...'}</span>
            <span className="balance-currency">{account.currency || 'INR'}</span>
          </div>
        </div>

        <div className="acc-id-box">
          <span title={account._id}>
            ID: {account._id.slice(0, 10)}...{account._id.slice(-6)}
          </span>
          <button
            onClick={handleCopy}
            className="copy-btn"
            title="Copy Full Account ID"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="acc-actions">
        <button
          onClick={handleRefresh}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
          disabled={refreshing}
          title="Refresh Balance"
        >
          <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
        </button>

        <button
          onClick={() => onInitiateTransfer(account._id)}
          className="btn btn-primary btn-sm"
          style={{ flex: 1.5 }}
        >
          <Send size={13} />
          <span>Transfer</span>
        </button>
      </div>
    </div>
  );
}
