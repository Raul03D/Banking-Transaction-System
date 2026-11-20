import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AuthView from './components/AuthView';
import AccountCard from './components/AccountCard';
import TransferModal from './components/TransferModal';
import InitialFundsModal from './components/InitialFundsModal';
import Notification from './components/Notification';
import { accountAPI, transactionAPI, authAPI } from './api';
import { Wallet, PlusCircle, Send, ShieldAlert, ArrowUpRight, Landmark, RefreshCw } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'transfer' | 'initialFunds' | null
  const [selectedFromAccountId, setSelectedFromAccountId] = useState('');

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all accounts and their respective balances
  const loadAccountsAndBalances = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await accountAPI.getAccounts();
      const userAccounts = res.accounts || [];
      setAccounts(userAccounts);

      // Fetch balances in parallel
      const balanceMap = {};
      await Promise.all(
        userAccounts.map(async (acc) => {
          try {
            const balRes = await accountAPI.getBalance(acc._id);
            balanceMap[acc._id] = balRes.balance ?? 0;
          } catch {
            balanceMap[acc._id] = 0;
          }
        })
      );
      setBalances(balanceMap);
    } catch (err) {
      addToast(err.message || 'Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAccountsAndBalances();
    }
  }, [user, loadAccountsAndBalances]);

  const handleCreateAccount = async () => {
    try {
      const res = await accountAPI.createAccount();
      addToast('Account created successfully!', 'success');
      await loadAccountsAndBalances();
    } catch (err) {
      addToast(err.message || 'Failed to create account', 'error');
    }
  };

  const handleRefreshSingleBalance = async (accountId) => {
    try {
      const balRes = await accountAPI.getBalance(accountId);
      setBalances((prev) => ({
        ...prev,
        [accountId]: balRes.balance ?? 0,
      }));
      addToast('Balance refreshed', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to refresh balance', 'error');
    }
  };

  const handleTransfer = async (payload) => {
    const res = await transactionAPI.transfer(payload);
    addToast(res.message || 'Transfer completed successfully!', 'success');
    await loadAccountsAndBalances();
  };

  const handleInitialFunds = async (payload) => {
    const res = await transactionAPI.initialFunds(payload);
    addToast(res.message || 'Initial funds deposited successfully!', 'success');
    await loadAccountsAndBalances();
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setAccounts([]);
      setBalances({});
      addToast('Logged out successfully', 'success');
    }
  };

  // If not logged in, render modern Auth view
  if (!user) {
    return (
      <div className="app-container">
        <AuthView onAuthSuccess={(userData) => setUser(userData)} />
        <Notification toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  // Calculate total net worth across active accounts
  const totalBalance = Object.values(balances).reduce((sum, b) => sum + (Number(b) || 0), 0);

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user.name}</h1>
        <p className="dashboard-subtitle">
          Manage your accounts, review balances, and transfer funds securely.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹</span>
          </div>
          <div>
            <div className="stat-label">Total Balance</div>
            <div className="stat-value">₹{totalBalance.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Wallet size={24} />
          </div>
          <div>
            <div className="stat-label">Active Accounts</div>
            <div className="stat-value">{accounts.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Landmark size={24} />
          </div>
          <div>
            <div className="stat-label">System Role</div>
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>
              {user.systemUser ? 'System Admin' : 'Standard Client'}
            </div>
          </div>
        </div>
      </div>

      {/* Accounts & Actions Section */}
      <div className="section-header">
        <div className="section-title">
          <Wallet size={20} color="#3b82f6" />
          <span>My Bank Accounts</span>
        </div>

        <div className="section-actions">
          <button
            onClick={() => loadAccountsAndBalances()}
            className="btn btn-secondary btn-sm"
            title="Refresh All Accounts"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleCreateAccount}
            className="btn btn-secondary"
            title="Create a new bank account"
          >
            <PlusCircle size={16} />
            <span>Create Account</span>
          </button>

          <button
            onClick={() => {
              setSelectedFromAccountId(accounts[0] ? accounts[0]._id : '');
              setActiveModal('transfer');
            }}
            className="btn btn-primary"
            disabled={accounts.length === 0}
          >
            <Send size={16} />
            <span>Transfer Money</span>
          </button>

          {/* Special Feature for System Users */}
          {user.systemUser && (
            <button
              onClick={() => setActiveModal('initialFunds')}
              className="btn btn-warning"
              title="Deposit initial liquidity into accounts"
            >
              <ShieldAlert size={16} />
              <span>Initial Funds</span>
            </button>
          )}
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="accounts-grid">
        {accounts.length > 0 ? (
          accounts.map((acc) => (
            <AccountCard
              key={acc._id}
              account={acc}
              balance={balances[acc._id]}
              onRefreshBalance={handleRefreshSingleBalance}
              onInitiateTransfer={(accId) => {
                setSelectedFromAccountId(accId);
                setActiveModal('transfer');
              }}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Wallet size={28} />
            </div>
            <div className="empty-title">No bank accounts yet</div>
            <div className="empty-subtitle">
              You do not have any active accounts. Create your first account to start sending and receiving funds.
            </div>
            <button onClick={handleCreateAccount} className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Create Account Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Transfer Funds Modal */}
      {activeModal === 'transfer' && (
        <TransferModal
          accounts={accounts}
          balances={balances}
          initialFromAccountId={selectedFromAccountId}
          onClose={() => setActiveModal(null)}
          onSubmit={handleTransfer}
        />
      )}

      {/* System Initial Funds Modal */}
      {activeModal === 'initialFunds' && (
        <InitialFundsModal
          onClose={() => setActiveModal(null)}
          onSubmit={handleInitialFunds}
        />
      )}

      {/* Toast Notifications */}
      <Notification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
