# Smart Waste Management System (BMC Project)

A comprehensive Smart Waste Management System designed for the Brihanmumbai Municipal Corporation (BMC). This system streamlines waste logging for shopkeepers and provides administrative oversight, real-time alerts, and automated fine management for BMC officials.

---

## 🚀 Key Features

### For Shopkeepers
- **Waste Logging**: Log daily waste (Dry, Wet, Hazardous) with bag sizes.
- **QR Code Integration**: Scan dustbin QR codes to log complaint.
- **Bulky Waste Requests**: Request pickup for large items.
- **Personal Dashboard**: View history and statistics of waste logs.
- **Profile Management**: Update shop details.

### For BMC Admins
- **Real-time Alerts**: Monitor waste collection status via Socket.io.
- **Automated Fine Management**: System tracks unlogged shops and issues fines for non-compliance.
- **QR Generator**: Generate and export QR codes for shop dustbins.
- **Comprehensive Reports**: Export waste logs and defaulter lists to Excel.
- **User Management**: Manage shopkeeper accounts and profiles.

---

## 🛠 Tech Stack

| Tier | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS 4, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Real-time** | Socket.io |
| **Authentication** | JWT, BcryptJS |
| **Reporting** | ExcelJS |

---

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local instance or MongoDB Atlas URI

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd BMC_Project
```

### 2. Backend Setup
Navigate to the `backend` directory and install dependencies.
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```
Update `.env` with your credentials:
- `MONGO_URI`: Your MongoDB URI
- `JWT_SECRET`: A secure random string
- `PORT`: 5000 (default)

### 3. Frontend Setup
Navigate to the `frontend` directory and install dependencies.
```bash
cd ../frontend
npm install
```

---

## 🏃‍♂️ Running the Application

### Option A: Start Backend
In the `backend` directory:
```bash
# Seed the database (First time only)
npm run seed

# Start server
npm start
```
*Backend runs on `http://localhost:5000`*

### Option B: Start Frontend
In the `frontend` directory:
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173` (default)*

---

## 📋 Default Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `2024alinakhan_db_user` | `ak1796` |
| **Shopkeeper** | `SHOP001` | `ak1796` |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate and get token.
- `GET /api/auth/profile` - Get current user profile.

### Waste Management
- `POST /api/waste/` - Create a waste log (Shopkeeper).
- `GET /api/waste/` - Get waste logs.
- `GET /api/waste/unlogged` - List shops that haven't logged waste today (Admin).
- `GET /api/waste/defaulters` - List shops with 3+ consecutive unlogged days (Admin).
- `GET /api/waste/export/logged` - Export logs to Excel (Admin).

### Alerts & Fines
- `GET /api/alert/` - View all alerts (Admin).
- `PUT /api/alert/:id` - Update alert status (Admin).
- `POST /api/fine/` - Issue a fine (Admin).
- `GET /api/fine/` - View fines (Shopkeeper/Admin).

### Dustbins
- `POST /api/dustbin/register` - Register a new dustbin (Admin).
- `GET /api/dustbin/qr/:qr_code_link` - Get dustbin info from QR.

---

## 📂 Project Structure

```text
BMC_Project/
├── backend/
│   ├── config/         # DB & Socket configurations
│   ├── controllers/    # Business logic
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   └── utils/          # Seeder and utilities
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # View components
│   │   └── api/        # Axios configurations
│   └── public/         # Static assets
└── README.md
```

---
*Developed for the BMC Smart Waste Management Initiative.*

