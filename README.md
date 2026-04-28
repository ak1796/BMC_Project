# 🌿 NagarVaani: Smart Market Waste Management

NagarVaani is a high-performance, real-time waste management and compliance platform designed for municipal markets. It streamlines the waste collection lifecycle by providing shopkeepers with intuitive logging tools, market administrators with robust oversight, and field officers with high-accuracy dispatch and navigation systems.

---

## 🚀 Key Features

### 🏢 For Market Administrators
- **Executive Command Center**: Real-time insights into market-wide compliance, collection ETAs, and active alerts via Socket.io.
- **Advanced QR Asset Management**: Generate and manage unique QR codes for municipal nodes with **Historical Archive** and **Read-Only Protection** to prevent data corruption.
- **Pinpoint Geolocation**: Capture exact GPS coordinates (Lat/Lng) during node deployment for 100% accurate field navigation.
- **Dynamic System Reports**: Generate and export targeted Excel reports for **Today**, **Last 7 Days**, or **Last 30 Days**.
- **Automated Fine Management**: Intelligent tracking systems automate penalty issuance for non-compliance.

### 👮 For Field Officers
- **Precision Dispatch Hub**: A dedicated dashboard for officers to view assigned tickets, priority levels, and task details.
- **Smart Navigation Integration**: One-click Google Maps routing that prioritizes **exact GPS coordinates** for municipal assets, ensuring officers reach the correct side of the district every time.
- **Automated Dispatch Notifications**: Instant email alerts with coordinate-linked navigation links for immediate response.

### 🏪 For Shopkeepers
- **Dual-Identifier Authentication**: Secure login using either a system-generated **Shop ID** or a personalized **Username**.
- **Real-Time Waste Logging**: Seamless logging for Dry, Wet, and Electronic waste with automatic volume estimation.
- **Service Hub & Tracker**: A centralized "Dispatch Hub" to track collections, emergency tickets, and bulky waste requests in one view.
- **Financial Transparency & Payments**: View penalty history and settle outstanding dues instantly via **Razorpay**.

### 🌍 For Citizens (Public Flow)
- **Anonymous Incident Reporting**: Any citizen can scan a node QR code to instantly report overflows or maintenance needs via the **Public Citizen Portal**.
- **No-Account Frictionless Reporting**: Instant access to a reporting interface (`/report`) without requiring login or signup.

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
| **Payments** | **Razorpay** | Complete e-commerce and cryptographically secure payment pipeline. |
| **Maps & GPS** | **Geolocation API** | Browser-level high-precision coordinate capture. |

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
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_dispatch_email
EMAIL_PASS=your_email_password
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

### 🔑 Authentication & Profiles
- `POST /api/auth/register` - Create a new shop account with Dual-ID support.
- `GET /api/admins` - Retrieve all regional BMC heads and office locations.
- `GET /api/officers/profile` - Access authenticated officer identity and assignments.

### 🌍 Public & QR Operations
- `GET /api/alerts/scan?dustbin={ID}` - Public endpoint that redirects QR scans to the Citizen Portal.
- `POST /api/alerts/public-report` - Submit an anonymous alert from a public QR scan.
- `GET /api/dustbins/all` - Securely retrieve historical asset records for the BMC archive.

### 🚛 Waste & Service Tickets
- `POST /api/wastelogs` - Register a standard or bulky waste entry.
- `GET /api/alerts` - Retrieve the active ticket feed for the authenticated user.
- `PUT /api/alerts/:id` - Update status (Queued/Dispatched/Resolved).

---

## 📂 Project Architecture

```text
BMC_Project/
├── backend/
│   ├── config/         # Database, Socket.io, and Middleware configs
│   ├── controllers/    # Core business logic (Waste, Auth, Alerts, Officers)
│   ├── models/         # Mongoose Schemas (WasteLog, Shopkeeper, Dustbin, Alert)
│   ├── routes/         # Express endpoint definitions
│   └── utils/          # Mail templates, Geolocation utils, and Cron jobs
└── frontend/
    ├── src/
    │   ├── pages/      # View layers (Dashboard, QR Generator, Citizen Report)
    │   ├── context/    # Global State (AuthContext)
    │   └── assets/     # Styling tokens and imagery
```

---

> [!IMPORTANT]
> **Pinpoint Accuracy Protocol**: Administrators should capture GPS coordinates at the physical deployment site to ensure field officers are routed to the exact side of the district, bypassing common address-string ambiguities.

*Developed with focus on Municipal Productivity and Sustainable Urban Management.*
