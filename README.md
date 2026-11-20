# Banking Transaction System (NovaBank)

Full-stack Banking Transaction System with a Node.js/Express/MongoDB backend and a modern React (Vite) frontend.

---

## 📁 Project Structure

```text
Banking Transaction Sys/
├── Backend/                 # Express REST API, Mongoose Models, JWT Auth
│   ├── src/
│   │   ├── config/          # Database configuration (MongoDB Atlas)
│   │   ├── controllers/     # Auth, Account, Transaction controllers
│   │   ├── middleware/      # JWT auth and System User middlewares
│   │   ├── models/          # User, Account, Transaction, Ledger models
│   │   ├── routes/          # API route definitions
│   │   └── services/        # Email notification service
│   ├── server.js            # Server entrypoint (Port 3000)
│   └── package.json
│
└── Frontend/                # Modern React (Vite) Dashboard
    ├── src/
    │   ├── components/      # Navbar, AccountCard, TransferModal, InitialFundsModal, AuthView
    │   ├── api.js           # Centralized API service with proxy & auth headers
    │   ├── App.jsx          # Main banking dashboard & state orchestration
    │   └── index.css        # Modern glassmorphism & responsive theme
    ├── vite.config.js       # Vite dev server with /api proxy to Backend:3000
    └── package.json
```

---

## 🚀 Getting Started

### 1. Start the Backend
Open a terminal in the `Backend` directory:
```bash
cd Backend
npm run dev
```
- Server runs on: `http://localhost:3000`

### 2. Start the Frontend
Open a second terminal in the `Frontend` directory:
```bash
cd Frontend
npm run dev
```
- React Frontend runs on: `http://localhost:5173`

---

## ✨ Features & Endpoints

### 🔐 Authentication
- **Register**: `POST /api/auth/register` (Name, Email, Password)
- **Login**: `POST /api/auth/login` (Email, Password)
- **Logout**: `POST /api/auth/logout`

### 💳 Accounts
- **Create Account**: `POST /api/account` (Instantly generates user bank account)
- **List Accounts**: `GET /api/account` (Fetches user's accounts)
- **Check Balance**: `GET /api/account/balance/:accountId` (Computes live balance from ledger)

### 💸 Transactions
- **Transfer Funds**: `POST /api/transaction` (Safe debit/credit with idempotency keys)
- **System Initial Funds**: `POST /api/transaction/system/initial-funds` (Admin-only initial liquidity injection)
