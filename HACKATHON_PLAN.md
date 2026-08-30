# 🚀 Hackathon Project Plan

> **Instructions for the Team**: When the hackathon problem statement is announced, spend 20–30 minutes filling out this document as a team before writing domain-specific code. This ensures complete alignment and eliminates wasted effort.

---

## 1. Problem

### What is the problem?
> *[Describe the core pain point in 1–2 clear sentences]*

### Who experiences it?
> *[Target demographic, profession, community, or business type]*

### Why is it a problem?
> *[Financial loss, wasted hours, lack of access, inefficient manual processes, etc.]*

### How do people solve it currently?
> *[Spreadsheets, paper forms, multiple disjointed tools, manual phone calls, etc.]*

### What is wrong with the current solution?
> *[Slow, error-prone, fragmented, expensive, not accessible on mobile, etc.]*

---

## 2. Target Users

**Primary users:**
> *[Direct operators/users who will use the system daily]*

**Secondary users:**
> *[Managers, administrators, auditors, or clients who view reports/stats]*

**Who would actually use / pay for this?**
> *[The decision maker with budget or the direct beneficiary]*

---

## 3. Our Solution

### One-sentence solution
> We are building **[Product Name]** that helps **[Target Audience]** to **[Core Benefit/Outcome]** through **[Key Innovation]**.

### How it works

```text
User / Stakeholder
       ↓
[Step 1: Input / Request / Trigger on Next.js UI]
       ↓
[Step 2: Processed via Express REST API & MongoDB]
       ↓
[Step 3: Automated logic / Status Transition / Match]
       ↓
[Result: Instant Resolution / Dashboard Metric / Export]
```

---

## 4. Core Features

### 🔴 Must Have — MVP (P0) — Target: 0 to 4 Hours
1. **User Authentication**: Secure JWT Signup/Login with Role-based access (`user` vs `admin`).
2. **Core Domain Model CRUD**: Create, view, update, and delete the main resource (e.g., Projects, Bookings, Tickets).
3. **Interactive Dashboard**: Real-time status cards, filterable data tables, and quick action modals.
4. **Status & Workflow Engine**: Progression tracking (e.g., `pending` → `active` → `completed`).
5. **Clean Responsive UI**: Mobile-friendly navigation with shadcn/ui and Tailwind CSS.

### 🟡 Should Have (P1) — Target: 4 to 8 Hours
1. **Search & Multi-field Filtering**: Instant search by keyword, category, date, or status.
2. **Analytics & Visual Trends**: Charts showing distribution breakdowns and operational throughput.
3. **Role Authorization UI**: Admins can manage users and access privileged controls.

### 🟢 Nice to Have (P2) — Target: If Time Remains
1. **Export / Reporting**: Export data as CSV/JSON or printable summary.
2. **Notifications**: In-app toast feedback and status activity log.
3. **AI / Smart Helper**: Simple LLM summary or recommendation API endpoint.

> [!IMPORTANT]
> **Golden Rule**: If the P0 MVP isn't 100% bug-free and working, do NOT touch P1 or P2 features.

---

## 5. User Roles

### Role 1: Standard User (`role: "user"`)
**Can:**
- Register and login to their personal dashboard.
- Create and manage their own resources.
- Filter, search, and view live status updates.
- Update profile details and credentials.

### Role 2: Administrator (`role: "admin"`)
**Can:**
- Access all resources across the platform.
- Create, edit, and delete any resource record.
- View and manage registered users (`/dashboard/users`).
- Inspect global analytics and system metrics.

---

## 6. Main User Flow

```text
       Landing Page (/)
             ↓
    Sign Up / Sign In (/login)
             ↓
     Overview Dashboard (/dashboard)
             ↓
   [Action: Click "Add Resource" Modal]
             ↓
   [Fills Details & Submits Form]
             ↓
   [Express API Saves to MongoDB]
             ↓
   [Table Updates Instantly with Badge]
             ↓
   [View Analytics & Status Insights]
```

---

## 7. Pages / Routes

### Public Pages
```text
/            → SaaS Landing page (Hero, Features, How It Works, CTA)
/login       → Authentication login with demo autofill
/signup      → User registration with validation
```

### Protected Dashboard (`/dashboard`)
```text
/dashboard             → High-level metrics, recent activity, quick actions
/dashboard/resources   → Domain table with search, status filters, Add/Edit/Delete modals
/dashboard/users       → User management & role assignment (Admin access)
/dashboard/analytics   → Visual breakdown charts & distribution graphs
/dashboard/profile     → User profile details & password updates
/dashboard/settings    → Account, security policies & developer preferences
```

---

## 8. Database Design

### User Schema (`backend/models/User.js`)
```text
User
├── _id          (ObjectId)
├── name         (String, required)
├── email        (String, unique, lowercase)
├── password     (String, bcrypt hashed, select: false)
├── role         (String, enum: ['user', 'admin'], default: 'user')
├── createdAt    (Date, timestamp)
└── updatedAt    (Date, timestamp)
```

### Main Domain Schema (`backend/models/Resource.js` — Rename as needed)
```text
Resource (e.g., Project / Booking / Patient / Task)
├── _id          (ObjectId)
├── name         (String, required)
├── description  (String)
├── status       (String, enum: ['active', 'pending', 'inactive', 'archived'])
├── createdBy    (ObjectId, ref: 'User')
├── createdAt    (Date, timestamp)
└── updatedAt    (Date, timestamp)
```

---

## 9. REST API Plan

### Authentication (`/api/auth`)
```text
POST   /api/auth/signup      # Register user & generate JWT
POST   /api/auth/login       # Validate credentials & generate JWT
GET    /api/auth/me          # Fetch current user profile (Protected)
POST   /api/auth/logout      # Clear session
```

### Main Domain APIs (`/api/resources`)
```text
GET    /api/resources        # Query with ?search=&status=&sort=
GET    /api/resources/:id    # Fetch single record
POST   /api/resources        # Create record (attaches req.user._id)
PUT    /api/resources/:id    # Update record
DELETE /api/resources/:id    # Delete record
```

### User Management APIs (`/api/users`)
```text
GET    /api/users            # List all users (Protected)
GET    /api/users/:id        # Get user details
POST   /api/users            # Create user (Admin only)
PUT    /api/users/:id        # Update user (Self or Admin)
DELETE /api/users/:id        # Delete user (Admin only)
```

---

## 10. Authentication & Authorization Matrix

| Action | Standard User | Administrator |
| :--- | :---: | :---: |
| **Browse Landing & Auth Pages** | ✅ | ✅ |
| **View Dashboard Overview** | ✅ | ✅ |
| **Create & Edit Own Records** | ✅ | ✅ |
| **Delete Own Records** | ✅ | ✅ |
| **Edit/Delete Any Record** | ❌ | ✅ |
| **Manage Users & Role Assignment** | ❌ | ✅ |
| **View System Analytics** | ✅ | ✅ |

---

## 11. Technology Stack

- **Frontend**: Next.js 14 App Router (JavaScript), Tailwind CSS v4, shadcn/ui, Lucide Icons, Sonner.
- **Backend**: Node.js, Express.js REST API, Morgan logger, CORS, centralized error middleware.
- **Database**: MongoDB Atlas / Local Mongoose ODM.
- **Security**: JWT stateless bearer tokens, bcryptjs password hashing.
- **Deployment**:
  - Frontend: Vercel (`NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`)
  - Backend: Render / Railway / VPS
  - Database: MongoDB Atlas cloud cluster

---

## 12. What Makes Our Product Different?

### Existing Solutions
1. *[Competitor / Legacy Tool 1]*
2. *[Competitor / Legacy Tool 2]*

### Their Weaknesses
- Complex setup requiring extensive training.
- Not optimized for real-time collaborative speed.
- High recurring subscription costs.

### Our Advantage
- **Fast, intuitive zero-friction workflow**: Solves the problem in 3 clicks.
- **Role-tailored transparency**: Keeps both users and managers synchronized.
- **Modular & lightweight**: Zero bloat, responsive on desktop and mobile devices.

---

## 13. Business & Impact Potential

- **Who Benefits**: *[Primary stakeholders and organizations]*
- **Monetization Model**:
  - **Free Tier**: Basic individual usage with standard quotas.
  - **Pro / Team Tier**: Advanced analytics, multi-admin management, and priority processing.
- **Social / University Impact**: Direct efficiency boost for target community.

---

## 14. Demo Presentation Script (3-Minute Pitch)

> **"Imagine I am [User Persona]. Every day I struggle with [Specific Problem].**
> **Current tools require [Tedious Workaround], which causes [Negative Impact].**
> 
> **With our platform, I simply open [App URL], sign in, and within seconds I can [Perform Action].**
> **Our Express and MongoDB backend automatically processes the request, updates status in real-time, and surfaces immediate insights on the Dashboard.**
> 
> **In under 24 hours, our team built a fully functional, production-ready solution."**

### Live Demo Checklist (For Hackathon Judges)
- [ ] 1. Open Landing Page → Highlight clean design and value proposition.
- [ ] 2. Login as Demo Admin (`admin@example.com` / `password123`).
- [ ] 3. Show Dashboard Overview → Stat cards & recent records.
- [ ] 4. Navigate to Resources → Create a new item live.
- [ ] 5. Filter/Search the table and edit the status live.
- [ ] 6. Show Analytics view → Real-time distribution.
- [ ] 7. Show User Management → Admin role controls.
- [ ] 8. Conclude with business impact & future roadmap.
