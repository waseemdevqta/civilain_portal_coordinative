# Full Stack Hackathon Boilerplate — Next.js + Express.js + MongoDB

> **A clean, production-style, reusable hackathon starter designed to be quickly customized during university hackathons.**

---

## ⚡ Project Overview

This repository provides a decoupled full-stack architecture adhering strictly to university hackathon standards (Custom Express backend + Next.js App Router + MongoDB).

- **Strict Separation of Concerns**: Next.js frontend communicates exclusively via standard HTTP REST APIs with Express.
- **Pure JavaScript**: Built with JavaScript (`.jsx` / `.js`) to remove TypeScript friction and enable ultra-fast iteration during hackathon time constraints.
- **Generic Resource Pattern**: Features a generic `Resource` entity that can easily be renamed into `Projects`, `Students`, `Properties`, `Patients`, `Products`, or any domain.
- **Modern UI / UX**: Styled with Tailwind CSS, shadcn/ui design patterns, Lucide icons, responsive drawer navigation, and dark mode.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router)** | Client UI, client-side routing, protected layouts |
| **Styling** | **Tailwind CSS v4 + shadcn/ui** | Theme tokens, modern single `@import "tailwindcss"`, modular components |
| **Icons** | **Lucide React** | Modern icons |
| **Backend** | **Node.js & Express.js** | Custom REST API server |
| **Database** | **MongoDB & Mongoose ODM** | Document database with schemas & timestamps |
| **Auth** | **JWT & bcryptjs** | Stateless token auth & secure password hashing |
| **API Client** | **Axios (`lib/api.js`)** | Centralized client with auth headers and error handling |

---

## 📁 Monorepo Structure

```text
express_next/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # Signup, Login, Me, Logout
│   │   ├── userController.js     # User CRUD (admin & self)
│   │   └── resourceController.js # Generic Resource CRUD
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification (protect) & admin role check
│   │   └── errorMiddleware.js    # 404 handler & centralized error handler
│   ├── models/
│   │   ├── User.js               # User model with bcrypt password hashing
│   │   └── Resource.js           # Generic Resource model
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── userRoutes.js         # /api/users routes
│   │   └── resourceRoutes.js     # /api/resources routes
│   ├── utils/
│   │   ├── generateToken.js      # JWT token signer
│   │   └── apiResponse.js        # Standardized { success, message, data } helper
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Server entry point, CORS, routes mounting
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.jsx    # Login page with demo autofill
│   │   │   └── signup/page.jsx   # Registration page
│   │   ├── (dashboard)/dashboard/
│   │   │   ├── layout.jsx        # Protected layout, Sidebar & Navbar
│   │   │   ├── page.jsx          # Dashboard overview & metrics
│   │   │   ├── resources/page.jsx# Resource management CRUD table & modals
│   │   │   ├── users/page.jsx    # User management CRUD table
│   │   │   ├── analytics/page.jsx# Responsive charts & distribution cards
│   │   │   ├── profile/page.jsx  # Profile view & update form
│   │   │   └── settings/page.jsx # System settings tabs
│   │   ├── layout.jsx            # Root layout with AuthProvider & Toaster
│   │   ├── page.jsx              # SaaS Landing page
│   │   └── globals.css           # Tailwind base styles & theme variables
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, Table, Dialog, Sheet, etc.
│   │   ├── landing/              # Landing page sections
│   │   ├── dashboard/            # Sidebar, Navbar, StatCards, Modals
│   │   └── common/               # ProtectedRoute, EmptyState, ConfirmDialog
│   ├── context/
│   │   └── AuthContext.jsx       # Global auth provider & token sync
│   ├── lib/
│   │   ├── api.js                # Centralized Axios API client & endpoints
│   │   └── utils.js              # `cn` and date formatting helpers
│   ├── .env.example
│   ├── jsconfig.json             # Absolute `@/*` path mapping
│   ├── tailwind.config.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js** v18+ (tested on v22.x)
- **MongoDB** (MongoDB Atlas connection string or local MongoDB instance)

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hackathon_db?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_change_me_in_production
   JWT_EXPIRES_IN=30d
   CLIENT_URL=http://localhost:3000
   ```

4. Start the Express development server (with nodemon):
   ```bash
   npm run dev
   ```
   Backend runs at: `http://localhost:5000`  
   Health endpoint: `http://localhost:5000/api/health`

---

### 3. Frontend Setup

1. In a new terminal window, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:3000`

---

## 📡 REST API Reference

All successful responses follow the standard envelope:
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { ... }
}
```

All error responses follow:
```json
{
  "success": false,
  "message": "Error description"
}
```

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register new user & return JWT token |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Protected | Get current authenticated user profile |
| `POST` | `/api/auth/logout` | Public | Clear server session / client logout |

### 👥 Users (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Protected | List all users (query by `?search=&role=`) |
| `GET` | `/api/users/:id` | Protected | Get user details by ID |
| `POST` | `/api/users` | Admin | Create a new user account |
| `PUT` | `/api/users/:id` | Protected | Update profile (self or admin) |
| `DELETE` | `/api/users/:id` | Admin / Self | Delete user account |

### 📦 Generic Resources (`/api/resources`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/resources` | Protected | List resources (query by `?search=&status=`) |
| `GET` | `/api/resources/:id` | Protected | Get single resource by ID |
| `POST` | `/api/resources` | Protected | Create new resource (attaches `createdBy`) |
| `PUT` | `/api/resources/:id` | Protected | Update resource fields |
| `DELETE` | `/api/resources/:id` | Protected | Delete resource by ID |

### 🩺 Health Endpoint

- `GET /api/health` → `{"success": true, "message": "API is running"}`

---

## 💡 How to Customize for Your Hackathon Problem

When your hackathon challenge topic is announced:

1. **Rename the Resource Model**:
   - In `backend/models/Resource.js`, add domain fields (e.g. `price`, `patientAge`, `dueDate`, `location`).
   - In `backend/controllers/resourceController.js`, update any custom query logic.
2. **Update API Services**:
   - In `frontend/lib/api.js`, adjust or expand `resourceApi` methods.
3. **Adjust Frontend UI**:
   - In `frontend/app/(dashboard)/dashboard/resources/page.jsx`, update the table columns and dialog form inputs.
4. **Deploy**:
   - Deploy backend to Render, Railway, or VPS.
   - Deploy frontend to Vercel. Set `NEXT_PUBLIC_API_URL` to your backend URL.
