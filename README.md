# 🌿 NagarVaani: Smart Market Waste Management

NagarVaani is a high-performance, real-time waste management and compliance platform designed for municipal markets. It streamlines the waste collection lifecycle by providing shopkeepers with intuitive logging tools and market administrators with robust oversight and automated penalty systems.

---

## 🚀 Key Features

### 🏪 For Shopkeepers
- **Dual-Identifier Authentication**: Secure login using either a system-generated **Shop ID** or a personalized **Username**.
- **Real-Time Waste Logging**: Seamless logging for Dry, Wet, and Electronic waste with automatic volume estimation.
- **Service Hub & Tracker**: A centralized "Dispatch Hub" to track collections, emergency tickets, and bulky waste requests in one view.
- **Smart Issue Reporting**: Report overflows or bin anomalies using a built-in QR scanner or manual entry.
- **Financial Transparency**: View penalty history and settle outstanding dues directly through an integrated statement view.

### 🛡️ For Market Administrators
- **Executive Dashboard**: Real-time insights into market-wide compliance, collection ETAs, and active alerts via Socket.io.
- **Dynamic System Reports**: Generate and export targeted Excel reports for **Today**, **Last 7 Days**, or **Last 30 Days**.
- **Automated Fine Management**: Intelligent tracking systems that identify non-compliant shops and automate penalty issuance.
- **QR Asset Management**: Generate and manage unique QR codes for market bin nodes.
- **Priority Dispatch**: Delegate and track emergency waste collection protocols with real-time status updates for shopkeepers.

---

## 🛠 Tech Stack

| Tier | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React 18 (Vite)** | Modern, fast, and responsive UI. |
| **Styling** | **Tailwind CSS 4** | High-utility styling for a premium SaaS aesthetic. |
| **Animations** | **Framer Motion** | Smooth transitions and interactive micro-animations. |
| **Backend** | **Node.js / Express** | Scalable and robust API backbone. |
| **Database** | **MongoDB (Mongoose)** | Flexible document storage for logs and users. |
| **Real-time** | **Socket.io** | Low-latency bi-directional event streaming. |
| **Reports** | **ExcelJS** | Server-side generation of high-quality `.xlsx` reports. |

---

## ⚙️ Installation & Setup

### 1. Repository Initialization
```bash
git clone <repository-url>
cd BMC_Project
```

### 2. Backend Orchestration
Navigate to the `backend` directory and install dependencies.
```bash
cd backend
npm install
```
Configure your environment in `.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000
```
**Start the server:**
```bash
# Recommended for Development (HMR enabled)
npm run dev

# For Production
npm start
```

### 3. Frontend Assembly
Navigate to the `frontend` directory and initialize the interface.
```bash
cd ../frontend
npm install
npm run dev
```

---

## 📑 API Reference & Protocols

### 🔑 Authentication
- `POST /api/auth/register` - Create a new shop account with Dual-ID support.
- `POST /api/auth/login` - Unified login for Shopkeeper and Admin roles.

### 📊 Reports & Data (Admin Only)
- `GET /api/wastelogs/export/logged?days={N}` - Export successful logs for a specific range (1/7/30).
- `GET /api/wastelogs/export/unlogged?days={N}` - Export list of defaulters for the specified period.

### 🚛 Waste & Service Tickets
- `POST /api/wastelogs` - Register a standard or bulky waste entry.
- `GET /api/alerts` - Retrieve the active ticket feed for the authenticated user.
- `PUT /api/alerts/:id` - Update status (Queued/Dispatched/Resolved) and resolution messages.

---

## 📂 Project Architecture

```text
BMC_Project/
├── backend/
│   ├── config/         # Database, Socket.io, and Middleware configs
│   ├── controllers/    # Core business logic (Waste, Auth, Alerts)
│   ├── models/         # Mongoose Schemas (WasteLog, Shopkeeper, Fine)
│   ├── routes/         # Express endpoint definitions
│   └── utils/          # Automation (Cron jobs) and Data Seeders
└── frontend/
    ├── src/
    │   ├── pages/      # View layers (Dashboard, History, Settings)
    │   ├── context/    # Global State (AuthContext)
    │   └── assets/     # Styling tokens and imagery
```

---

> [!IMPORTANT]
> **Defaulter Policy**: Shops failing to register a waste entry for 3 consecutive days are automatically flagged in the System Health dashboard and issued a compliance fine.

*Developed with focus on Municipal Productivity and Sustainable Urban Management.*
