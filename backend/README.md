# AWAZ — Backend REST API & Services

RESTful API backend for the **AWAZ Civic Platform**, handling authentication, complaint lifecycles, democratic community upvotes, Cloudinary visual evidence, Gemini AI operational briefings, 3-tier staff management (Super Officer, Officers, Field Technicians), and field task assignments.

---

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM (with in-memory fallback for resilient test/dev)
- **Authentication**: JWT (JSON Web Tokens) with Access Token (15m) + Refresh Token (7d) rotation
- **Security**: Password hashing with `bcryptjs`, fine-grained RBAC (`citizen`, `officer`, `technician`, `isSuperOfficer`), CORS configuration
- **AI Integration**: Google Gemini API (`gemini-3.6-flash`)
- **Media Upload**: Cloudinary REST API with multipart file handling

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js                 # MongoDB connection & resilient fallback
│   └── gemini.js             # Google GenAI client & briefing service
├── controllers/
│   ├── authController.js     # Citizen signup, credentials login, profile
│   ├── complaintController.js# Complaint CRUD, upvotes, status, technician assignment
│   ├── staffController.js    # Super Officer provisioning, assignment, deletion
│   ├── aiController.js       # Officer AI operational briefing via Gemini
│   └── uploadController.js   # Cloudinary image upload handler
├── middleware/
│   ├── authMiddleware.js     # JWT verification & req.user attachment
│   ├── roleMiddleware.js     # requireCitizen, requireOfficer, requireSuperOfficer guards
│   └── errorMiddleware.js    # Centralized error handler & 404 handler
├── models/
│   ├── User.js               # Citizen, Officer, Technician schema
│   └── Complaint.js          # Complaint lifecycle schema & feedback tracking
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── complaintRoutes.js    # /api/complaints routes
│   ├── staffRoutes.js        # /api/staff routes
│   ├── aiRoutes.js           # /api/ai routes
│   └── uploadRoutes.js       # /api/upload routes
├── utils/
│   ├── priority.js           # Dynamic score calculation engine
│   ├── apiResponse.js        # Standardized JSON response helpers
│   └── generateToken.js      # JWT signing utility
├── scripts/
│   ├── seed.js               # Database seeding script (Super Officer initialized from .env)
│   └── test-api.js           # Automated API integration test runner
├── server.js                 # Express server bootstrap & route mounting
├── .env                      # Local environment configuration
├── .env.example              # Template environment configuration
└── package.json              # Dependencies and npm scripts
```

---

## 🛠️ Installation & Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Populate .env with your MongoDB, Gemini, Cloudinary, and Seed Officer credentials
   ```

3. **Seed the database (Initializes Super Officer)**:
   ```bash
   node scripts/seed.js
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   API runs at: `http://localhost:5000`  
   Health check: `http://localhost:5000/api/health`

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register citizen account |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Protected | Get authenticated profile |
| `POST` | `/api/auth/refresh` | Public | Refresh expired access token |
| `PUT` | `/api/auth/profile` | Protected | Update profile |

### 📋 Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/complaints` | Public | List complaints with search & filters |
| `POST` | `/api/complaints` | Citizen | Create new complaint |
| `GET` | `/api/complaints/mine` | Citizen | Get complaints by logged-in citizen |
| `GET` | `/api/complaints/:id` | Public | Get complaint details by ID |
| `PATCH` | `/api/complaints/:id/upvote` | Citizen | Upvote complaint |
| `PATCH` | `/api/complaints/:id/status` | Officer | Update status, remarks & resolution proof |
| `PATCH` | `/api/complaints/:id/assign` | Officer | Assign technician to complaint |
| `PATCH` | `/api/complaints/:id/feedback` | Citizen | Submit resolution star rating |
| `GET` | `/api/complaints/stats` | Officer | Aggregated statistics |
| `GET` | `/api/complaints/export` | Officer | Export CSV dataset |
| `GET` | `/api/complaints/duplicates` | Citizen | Check for duplicates |

### 👥 Staff Management (`/api/staff`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/staff` | Officer | List staff (Super Officer: all; Officer: direct technicians) |
| `GET` | `/api/staff/officers` | Super Officer | List all officers |
| `GET` | `/api/staff/technicians`| Officer | List technicians under requesting officer |
| `POST` | `/api/staff/provision` | Super Officer | Create Officer or Technician account |
| `PATCH` | `/api/staff/:id/assign-officer` | Super Officer | Assign technician to officer |
| `DELETE`| `/api/staff/:id` | Super Officer | Remove staff member (Super Officer protected) |

### 🤖 AI Operational Intelligence (`/api/ai`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/officer-summary` | Officer | Generate Gemini AI operational summary |
| `POST` | `/api/ai/analyze-complaint`| Citizen | AI complaint triage & recommendations |

### 📸 Media Uploads (`/api/upload`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Protected | Upload image to Cloudinary (`evidence` or `resolution`) |
