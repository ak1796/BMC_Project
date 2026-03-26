# Smart Waste Management System (BMC Project)

A production-ready Node.js/Express backend for a Smart Waste Management System, designed to streamline waste logging for shopkeepers and provide administrative oversight for BMC officials.

## 🚀 Features

- **JWT Authentication**: Secure login for Admin and Shopkeepers.
- **Role-Based Access Control (RBAC)**: Distinct functionalities for BMC Admins and Shopkeepers.
- **Waste Logging**: Detailed logging of waste type, bag size, and bulky waste requests.
- **Real-time Alerts**: Administrative alerts via Socket.io for critical events.
- **Administrative Tracking**: Identify unlogged shops and automate fine management for consecutive missing logs.
- **Spreadsheet Exports**: Generate Excel reports for waste logs using ExcelJS.
- **Database Seeding**: Easily set up initial environment with pre-configured accounts.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Auth**: JSON Web Tokens (JWT) & BcryptJS
- **Reporting**: ExcelJS

## 📋 Prerequisites

- **Node.js**: v14.x or higher
- **npm**: v6.x or higher
- **MongoDB**: A running instance (Local or MongoDB Atlas)

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd BMC_Project
```

### 2. Install Dependencies
Navigate to the backend directory and install the required npm packages.
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory by copying the `.env.example` file.
```bash
cp .env.example .env
```
Update the `.env` file with your actual configuration:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secure secret key for signing tokens.
- `PORT`: The port on which the server will run (default: 5000).

### 4. Database Seeding
Initialize your database with a default Admin and Shopkeeper account.
```bash
npm run seed
```
**Default Credentials:**
- **Admin**: `2024alinakhan_db_user` / `ak1796`
- **Shopkeeper**: `SHOP001` / `ak1796`

## 🏃‍♂️ Running the Application

### Start Development Server
```bash
npm start
```
The server will start (default: `http://localhost:5000`) and connect to MongoDB.

## 📂 Project Structure

```text
backend/
├── config/       # Database and Socket.io configurations
├── controllers/  # Business logic for routes
├── middlewares/  # Authentication and error handling
├── models/       # Mongoose schemas
├── routes/       # API endpoint definitions
├── utils/        # Utility scripts (seeder, etc.)
├── app.js        # Express application setup
└── server.js      # Server entry point
```

## 📡 API Endpoints (Quick View)

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Public | Authenticate user & get token |
| `/api/waste/log` | POST | Shopkeeper | Log daily waste entry |
| `/api/admin/shops` | GET | Admin | List all registered shops |
| `/api/admin/alerts` | GET | Admin | View real-time waste alerts |

---
*Developed for the BMC Smart Waste Management Initiative.*
