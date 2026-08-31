# 📢 AWAZ — Civilian Coordination & Municipal Operations Platform

> **An AI-powered municipal issue reporting, democratic prioritization, and field crew dispatch platform bridging the gap between citizens and city administration.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express.js-green?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-forestgreen?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-blue?style=flat&logo=google)](https://ai.google.dev/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-blueviolet?style=flat&logo=cloudinary)](https://cloudinary.com/)

---

## 🌐 Live Deployments

- **Live Web Application (Vercel)**: [https://aawazapp.vercel.app/](https://aawazapp.vercel.app/)
- **Live REST API (Railway)**: [https://civilainportalcoordinative-production.up.railway.app/api](https://civilainportalcoordinative-production.up.railway.app/api)
- **API Health Check**: [https://civilainportalcoordinative-production.up.railway.app/api/health](https://civilainportalcoordinative-production.up.railway.app/api/health)

---

## ⚡ Core Problem & Solution

Cities struggle with unresolved potholes, overflowing garbage, broken water mains, and dangling power lines because communication between citizens and municipal field crews is fragmented and slow.

**AWAZ** solves this with a transparent, end-to-end civic operations platform:
1. **Citizens** report neighborhood hazards with photographic evidence and rally community support via democratic upvotes.
2. **AI & Dynamic Scoring** triage incidents, detect duplicates, and compute weighted priority scores based on hazard severity and public demand.
3. **Super Officers & Officers** manage field technicians, assign work orders, dispatch repair crews, and publish photo-verified resolutions.

---

## 🚀 Key Features

### 🏛️ 1. Citizen Experience & Incident Reporting
- **Self-Service Registration & Login (`/signup`, `/login`)**: Clean, secure email/password authentication.
- **Incident Reporting Wizard (`/complaints/new`)**: File issues with title, description, category, and neighborhood/zone.
  - *Categories*: Road & Potholes, Sanitation & Garbage, Clean Water Supply, Electricity & Power Lines, and Other.
- **Visual Evidence Upload (Cloudinary)**: Attach high-resolution photos of damaged infrastructure.
- **AI Triage & Duplicate Detection**: Instant Gemini AI suggestions on severity and nearby duplicate checks.
- **Personal Citizen Dashboard (`/dashboard`, `/complaints/mine`)**: Track ticket lifecycles (`Pending` ➔ `In Progress` ➔ `Resolved`).
- **Resolution Star Rating & Feedback**: Citizens rate the repair quality (1–5 stars) and leave comments once resolved.

### 🗳️ 2. Democratic Upvotes & Priority Engine
- **1-Click Community Upvoting**: Citizens can upvote neighbors' complaints across the Feed and Complaint Detail pages.
- **Dynamic Priority Scoring Algorithm**: Computes weighted scores combining hazard type, community upvotes, and age of complaint.
- **Democratic Priority Escalation**: Heavily upvoted issues are visually highlighted and escalated to the top of the municipal dispatch queue.
- **Impartiality Safeguards**: Officers cannot upvote tickets—they view clean, neutral supporter counts.

### 🛡️ 3. 3-Tier Staff Management & Field Dispatch Architecture
- **Root Super Officer**:
  - Securely initialized via environment variables (`isSuperOfficer: true`).
  - Immutable: Protected against deletion or downgrade.
  - Complete authority to provision Officers and Field Technicians, assign workers to officers, and remove staff.
- **Staff Management Console (`/officer/staff`)**:
  - Super Officer view to create, organize, and manage all municipal personnel.
  - Officer view displaying the roster of technicians under their direct command.
- **Field Crew Task Assignment**:
  - Supervising officers can assign complaint tickets to their field workers directly via the Operations Table or the Review Modal.
  - Assigned technician details appear on public complaint pages and official printable work orders.

### ⚡ 4. Officer Operations Command Console (`/officer/dashboard`)
- **Restricted Officer Portal Login (`/officer/login`)**: Dedicated command portal strictly for authorized municipal officers.
- **Live Operations Dashboard**: Metric cards tracking Total Tickets, In-Progress Dispatches, Resolved Cases, Critical Hazards, and Citizen Satisfaction.
- **Interactive Ticket Queue**: Full-text search, multi-filter dropdowns (Category, Status), and sorting (Upvotes, Recent, Priority).
- **Ticket Review & Status Updates**: Transition lifecycle states, record public officer remarks, and assign field technicians.
- **Resolution Proof Upload**: Upload photo evidence of completed repairs for side-by-side public verification.
- **Printable Municipal Work Order Dockets (`WorkOrderModal`)**: 1-click printable dispatch sheets for field crews with incident narrative, evidence photo, assigned crew contact, and signature seal.
- **CSV Data Export**: Export filtered complaint data to CSV for recordkeeping and auditing.

### 🤖 5. Gemini AI Operational Intelligence
- **Live AI Operational Briefing**: Gemini AI synthesizes active complaints to deliver an executive summary of municipal workload, critical hazard clusters, and dispatch bottlenecks.
- **AI Report Triage**: Recommends category, urgency rating, and estimated resolution timeline during report drafting.

---

## 👥 Role Hierarchy & Access Guide

| Role | Access URL | Capabilities | How to Access |
| :--- | :--- | :--- | :--- |
| **Super Officer** | [`/officer/login`](https://aawazapp.vercel.app/officer/login) | Provision officers & technicians, assign workers, delete staff, dispatch crews, update tickets | Use credentials set in `SEED_OFFICER_EMAIL` & `SEED_OFFICER_PASSWORD` |
| **Municipal Officer** | [`/officer/login`](https://aawazapp.vercel.app/officer/login) | Manage dispatch queue, assign tasks to assigned technicians, update status, upload resolution proof | Created by Super Officer in [`/officer/staff`](https://aawazapp.vercel.app/officer/staff) |
| **Field Technician** | Managed via Staff Console | Assigned to supervising officers and specific field work orders | Created by Super Officer with designation & contact |
| **Citizen** | [`/login`](https://aawazapp.vercel.app/login) | File complaints, upload photos, upvote community issues, track ticket progress, rate resolutions | Register self at [`/signup`](https://aawazapp.vercel.app/signup) |

---

## 🔑 How to Log In as Administrator / Officer

### 1. Default Super Officer Account
When the backend database is initialized, the root Super Officer account is automatically created from your environment variables:

- **Portal URL**: Navigate to `/officer/login` (or click **"Officer Portal"** in the footer).
- **Email**: Defined in `backend/.env` under `SEED_OFFICER_EMAIL` (default: `waseemahmedbaloch2004@gmail.com`)
- **Password**: Defined in `backend/.env` under `SEED_OFFICER_PASSWORD` (default: `Officer123!`)

### 2. Creating New Officers & Technicians
1. Log in to `/officer/login` as the Super Officer.
2. Click **"Staff & Crews"** in the top header (or navigate to `/officer/staff`).
3. Click **"Add Staff Member"**.
4. Select role (**Officer** or **Technician**), enter their name, email, password, phone, and designation.
5. If creating a Technician, select which Supervising Officer they report to.

---

## 📁 Repository Monorepo Structure

```text
express_next/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic (Atlas + in-memory fallback)
│   ├── controllers/
│   │   ├── authController.js     # Citizen signup, login, profile management
│   │   ├── complaintController.js# Complaint CRUD, upvoting, status updates, technician assignment
│   │   ├── staffController.js    # Super Officer provisioning, assignment, deletion
│   │   ├── aiController.js       # Gemini AI operational briefing & report triage
│   │   └── uploadController.js   # Cloudinary visual evidence uploader
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification
│   │   ├── roleMiddleware.js     # requireCitizen, requireOfficer, requireSuperOfficer
│   │   └── errorMiddleware.js    # Centralized error handler
│   ├── models/
│   │   ├── User.js               # Citizen, Officer, and Technician schema
│   │   └── Complaint.js          # Complaint ticket schema with evidence & feedback
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── complaintRoutes.js    # /api/complaints
│   │   ├── staffRoutes.js        # /api/staff
│   │   ├── aiRoutes.js           # /api/ai
│   │   └── uploadRoutes.js       # /api/upload
│   ├── scripts/
│   │   ├── seed.js               # Seeds root Super Officer from .env
│   │   └── test-api.js           # Automated API regression test suite
│   ├── server.js                 # Express app initialization, CORS & route mounting
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.jsx    # Clean citizen login
│   │   │   └── signup/page.jsx   # Citizen registration
│   │   ├── complaints/
│   │   │   ├── page.jsx          # Public searchable issues feed
│   │   │   ├── new/page.jsx      # Incident reporting wizard with photo upload
│   │   │   ├── mine/page.jsx     # Logged-in citizen's report tracker
│   │   │   └── [id]/page.jsx     # Detailed ticket view with lifecycle progress
│   │   ├── dashboard/
│   │   │   └── page.jsx          # Citizen analytics and ticket overview
│   │   ├── officer/
│   │   │   ├── login/page.jsx    # Gated dark municipal command portal login
│   │   │   ├── dashboard/page.jsx# Municipal Operations Console & dispatch table
│   │   │   └── staff/page.jsx    # 3-Tier Staff Management Console
│   │   ├── page.jsx              # Civic landing page with city pulse metrics
│   │   ├── layout.jsx            # Root layout with AuthProvider & Toaster
│   │   └── globals.css           # Tailwind base styles & theme variables
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx        # Role-aware responsive navigation bar
│   │   │   ├── Footer.jsx        # Footer with emergency hotlines & portal links
│   │   │   ├── ProtectedRoute.jsx# Client-side route guard
│   │   │   ├── ImageUploader.jsx # Cloudinary multipart image uploader
│   │   │   ├── ImageLightbox.jsx # Fullscreen photo inspection modal
│   │   │   ├── WorkOrderModal.jsx# Printable official municipal work order docket
│   │   │   └── StatusBadge.jsx   # Status, Priority, and Category badges
│   │   └── ui/                   # Button, Input, Dialog, Textarea primitives
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state, token sync, isOfficer, isSuperOfficer flags
│   ├── lib/
│   │   ├── api.js                # Axios client with dynamic base URL & refresh rotation
│   │   └── utils.js              # Class utility helpers
│   ├── .env.example
│   ├── .env.production
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 💻 Local Setup & Development Guide

### Prerequisites
- **Node.js** v18+ (tested on Node v22)
- **MongoDB** (Atlas connection string)

### 1. Clone & Install
```bash
git clone https://github.com/waseemdevqta/civilain_portal_coordinative.git
cd civilain_portal_coordinative
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
- API server runs at: `http://localhost:5000`
- Health check endpoint: `http://localhost:5000/api/health`

### 3. Start Frontend App
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Web application runs at: `http://localhost:3000`

### 4. Initialize Database Seed
To create the root Super Officer account:
```bash
cd backend
node scripts/seed.js
```

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register new citizen account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return tokens |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user profile |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token for fresh access token |
| `PUT` | `/api/auth/profile` | Protected | Update profile information |

### 📋 Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/complaints` | Public | List complaints with search, category, status & sorting |
| `POST` | `/api/complaints` | Citizen | Submit new incident report |
| `GET` | `/api/complaints/mine` | Citizen | List complaints submitted by logged-in citizen |
| `GET` | `/api/complaints/:id` | Public | Retrieve single complaint by ID |
| `PATCH` | `/api/complaints/:id/upvote` | Citizen | Upvote a complaint |
| `PATCH` | `/api/complaints/:id/status` | Officer | Update ticket status, officer remarks & resolution photo |
| `PATCH` | `/api/complaints/:id/assign` | Officer | Assign a field technician to a complaint |
| `PATCH` | `/api/complaints/:id/feedback` | Citizen | Submit star rating and resolution comment |
| `GET` | `/api/complaints/stats` | Officer | Get operational summary metrics |
| `GET` | `/api/complaints/export` | Officer | Download complaints dataset as CSV |
| `GET` | `/api/complaints/duplicates` | Citizen | Check for nearby duplicate active complaints |

### 👥 Staff Management (`/api/staff`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/staff` | Officer | List all staff (Super Officer) or direct technicians (Officer) |
| `GET` | `/api/staff/officers` | Super Officer | List all officers for assignment dropdowns |
| `GET` | `/api/staff/technicians`| Officer | List technicians under requesting officer |
| `POST` | `/api/staff/provision` | Super Officer | Provision new Officer or Technician account |
| `PATCH` | `/api/staff/:id/assign-officer` | Super Officer | Assign/reassign technician to an officer |
| `DELETE`| `/api/staff/:id` | Super Officer | Remove staff account (Super Officer protected) |

### 🤖 AI Operational Intelligence (`/api/ai`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/officer-summary` | Officer | Generate live Gemini AI operational executive briefing |
| `POST` | `/api/ai/analyze-complaint`| Citizen | AI draft triage, severity, and category recommendations |

### 📸 Media Uploads (`/api/upload`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Protected | Upload multipart photo to Cloudinary (`evidence` or `resolution`) |

---

## 🔒 Security & Architecture Standards
- **Stateless JWT with Refresh Rotation**: High-security token architecture with short-lived access tokens (15m) and long-lived refresh tokens (7d).
- **Role-Based Access Control (RBAC)**: Fine-grained access control across `citizen`, `officer`, `isSuperOfficer`, and `technician`.
- **Decoupled Monorepo Architecture**: Clean separation between Next.js frontend and Express REST API backend.
- **Dynamic Production Networking**: Automatic host detection ensuring seamless API connectivity on Vercel and Railway deployments.

---

## 📄 License
This project was built for the Saylani Mega Hackathon.
