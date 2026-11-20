// Centralized API client for Banking Transaction System

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    throw err;
  }
}

// Authentication API
export const authAPI = {
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
};

// Account API
export const accountAPI = {
  createAccount: () =>
    request('/account', {
      method: 'POST',
    }),

  getAccounts: () =>
    request('/account', {
      method: 'GET',
    }),

  getBalance: (accountId) =>
    request(`/account/balance/${accountId}`, {
      method: 'GET',
    }),
};

// Transaction API
export const transactionAPI = {
  transfer: ({ fromAccountId, toAccountId, amount, idempotencyKey }) =>
    request('/transaction', {
      method: 'POST',
      body: JSON.stringify({
        fromAccountId,
        toAccountId,
        amount: Number(amount),
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
      }),
    }),

  initialFunds: ({ toAccountId, amount, idempotencyKey }) =>
    request('/transaction/system/initial-funds', {
      method: 'POST',
      body: JSON.stringify({
        toAccountId,
        amount: Number(amount),
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
      }),
    }),
};
