# CivicFix — Citizen Complaint Portal (Backend REST API)

CivicFix is a robust, production-structured RESTful API built for a civic complaint portal where citizens can submit municipal issues (road damage, garbage accumulation, water supply, electricity hazards, etc.), upvote community issues, and submit feedback upon resolution. Government municipal officers can triage complaints, update operational statuses, view aggregated statistics, and generate an AI-powered daily briefing using the Google Gemini API.

---

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with `Authorization: Bearer <token>`
- **Security**: Password hashing with `bcryptjs`, role-based access control (`citizen` vs `officer`), CORS configuration, sanitized outputs
- **AI Integration**: Google Gemini API via `@google/genai` SDK (`gemini-3.6-flash`)
- **Environment Management**: `dotenv`

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js                 # MongoDB connection & resilient dev/test fallback
│   └── gemini.js             # Google GenAI client & briefing prompt service
├── controllers/
│   ├── authController.js     # Citizen signup, credentials login, profile
│   ├── complaintController.js# Complaints CRUD, upvoting, status, feedback, stats
│   └── aiController.js        # Officer AI summary generation via Gemini
├── middleware/
│   ├── authMiddleware.js     # JWT verification & req.user attachment
│   ├── roleMiddleware.js     # requireOfficer & requireCitizen role guards
│   └── errorMiddleware.js    # Centralized error handler & 404 handler
├── models/
│   ├── User.js               # User schema (citizen / officer) with bcrypt hashing
│   └── Complaint.js          # Complaint lifecycle schema & feedback tracking
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── complaintRoutes.js    # /api/complaints routes
│   └── aiRoutes.js           # /api/ai routes
├── utils/
│   ├── priority.js           # Dynamic score calculation (upvotes * 2 + daysSinceCreated)
│   ├── apiResponse.js        # Standardized JSON response helpers
│   └── generateToken.js      # JWT signing utility
├── scripts/
│   ├── seed.js               # Database seeding script (demo officer, citizens & complaints)
│   └── test-api.js           # Comprehensive automated 28-assertion integration test runner
├── server.js                 # Express server bootstrap & route mounting
├── .env                      # Local environment configuration
├── .env.example              # Template environment configuration
├── package.json              # Dependencies and npm scripts
└── README.md                 # Documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory (see `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/civicfix?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash
CLIENT_URL=http://localhost:3000
```

> **Note on MongoDB**: If connecting to MongoDB Atlas, ensure your network IP is whitelisted on your Atlas cluster. If offline or running tests, the system automatically uses an in-memory database fallback so you can develop without interruption.

---

## 🛠️ Installation & Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Update .env with your MONGODB_URI and GEMINI_API_KEY
   ```

4. **Seed the database**:
   ```bash
   npm run seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

---

## 🔑 Demo Credentials (Seeded)

The database seed script initializes the following accounts for testing:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Officer** | `officer@civicfix.demo` | `Officer123!` | Officer Tariq Baloch |
| **Citizen 1** | `ahmed@civicfix.demo` | `Citizen123!` | Ahmed Khan |
| **Citizen 2** | `fatima@civicfix.demo` | `Citizen123!` | Fatima Ali |
| **Citizen 3** | `bilal@civicfix.demo` | `Citizen123!` | Bilal Ahmed |

> **Security Note**: Public registration (`POST /api/auth/signup`) is strictly restricted to creating **Citizen** accounts. Officer accounts can only be provisioned via the seed script.

---

## 🧪 Automated Testing

To run the complete automated integration test suite covering 28 test cases across all endpoints, authentication, upvotes, duplicate checks, officer actions, feedback, and Gemini AI:

```bash
npm test
```

---

## 📡 API Endpoint Reference

### 1. Health Check
- `GET /api/health` — Public health check

### 2. Authentication (`/api/auth`)
- `POST /api/auth/signup` — Public registration (**Citizen only**). Body: `{ "name", "email", "password" }`
- `POST /api/auth/login` — Public login. Body: `{ "email", "password" }`. Returns `{ token, user }`
- `GET /api/auth/me` — Protected (requires Bearer token). Returns current user profile.

### 3. Complaints (`/api/complaints`)
- `GET /api/complaints` — **Public**. List complaints. Query params:
  - `?category=road|garbage|water|electricity|other`
  - `?status=pending|in-progress|resolved`
  - `?area=University Road`
  - `?search=pothole` (searches title, description, area)
  - `?sort=recent|upvotes`
- `POST /api/complaints` — **Citizen only**. Create complaint. Body: `{ "title", "description", "category", "area" }`
- `GET /api/complaints/mine` — **Citizen only**. Get current citizen's submitted complaints.
- `GET /api/complaints/duplicates` — **Citizen only**. Check potential duplicates. Query: `?category=garbage&area=University%20Road`
- `GET /api/complaints/:id` — **Public**. Retrieve full complaint details by ID.
- `PATCH /api/complaints/:id/upvote` — **Citizen only**. Upvote a complaint (single upvote per citizen enforced).
- `PATCH /api/complaints/:id/status` — **Officer only**. Update complaint status. Body: `{ "status": "in-progress"|"resolved"|"pending", "remark": "..." }`
- `PATCH /api/complaints/:id/feedback` — **Citizen author only**. Submit feedback on resolved complaint. Body: `{ "rating": 5, "comment": "..." }`
- `GET /api/complaints/stats` — **Officer only**. Retrieve aggregated metrics (total, statuses, priorities, top categories, top areas, average rating).

### 4. AI Officer Briefing (`/api/ai`)
- `POST /api/ai/officer-summary` — **Officer only**. Generates a concise 3-5 sentence operational briefing using Gemini based strictly on aggregated statistics without citizen PII.

---

## ⚡ Dynamic Priority Formula

Priority is computed dynamically on read and never permanently stored in the database:
$$\text{score} = (\text{upvotes} \times 2) + \text{daysSinceCreated}$$

- `score < 5` → **low**
- `5 <= score <= 15` → **medium**
- `16 <= score <= 30` → **high**
- `score > 30` → **critical**
