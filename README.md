# Bizora — Multi-Tenant Business Management SaaS

> **Business management, simplified.**

Bizora is a production-style, multi-tenant Business Management SaaS platform built on the modern MERN stack. Designed from first principles to represent real-world commercial SaaS architecture, Bizora features strict workspace isolation, role-based access control (RBAC), Socket.IO real-time collaboration, professional invoicing with automated number generation and PDF downloads, Stripe sandbox payment abstractions, physical inventory tracking with low-stock alerts, and an isolated customer Client Portal.

---

## 🚀 Key Features & Completed Modules

### 🏢 Multi-Tenancy & Workspace Architecture
- **Tenant Isolation**: Every business-owned document strictly enforces `{ businessId }` verified against user memberships via `tenantMiddleware`.
- **Workspace Switching**: Seamlessly toggle between multiple businesses or agencies from the user profile switcher.
- **RBAC Matrix**: Granular permissions across 5 roles: `OWNER`, `MANAGER`, `EMPLOYEE`, `CLIENT`, and platform `SUPER_ADMIN`.
- **Dual-Mode Persistence**: Live MongoDB connectivity with an automated in-memory `DevMockDb` fallback for frictionless local evaluation.

### 👥 Customer CRM & Team Management
- **Customer Directory**: Searchable, filterable client list with status tags, assigned account leads, and soft archiving.
- **Client Profiles**: Dedicated contact views with notes, interaction timeline, and project history.
- **Employee Directory**: Manage team members, job titles, department assignments, and access permissions.
- **Team Invitations**: Cryptographically signed invitation tokens with 7-day expiration and automated onboarding flow.

### 📋 Projects & Kanban Tasks
- **Project Tracking**: Engagement scopes, budgets, expenditures, client linkage, and percentage-based completion meters.
- **Kanban Board**: Drag-free intuitive workflow board (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`) with priority badges (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- **Deliverables**: Sub-tasks with checklist counters, assignees, and due-date alerts.

### 💼 Services Catalog
- Standard service packages with fixed/hourly rates, estimated durations, categories, and tax rates.

### 💳 Finance: Invoices, Payments & Expenses
- **Professional Invoices**: Automated secure numbering (`INV-YYYY-XXXX`), line-item repeaters, automatic tax/discount/total calculations.
- **Printable PDF Statements**: Browser print styles and clean invoice layout for client presentation.
- **Payment Gateway Abstraction**: Stripe/Razorpay sandbox integration with HMAC signature webhook verification and idempotent ledger reconciliation.
- **Expense Tracking**: Category-based operational burn tracking (Software, Office, Travel, Salary, Utilities) with vendor memo logs.

### 📦 Operations & Inventory Management
- **SKU Tracking**: Product catalog with minimum threshold alerts, cost prices, and selling margins.
- **Stock Audit Trail**: Immutable transaction logs recording every stock movement (`PURCHASE`, `SALE`, `ADJUSTMENT`, `RETURN`, `DAMAGE`).
- **Low-Stock Alerts**: Real-time broadcast when inventory dips below minimum threshold.

### ⚡ Real-Time Collaboration & Notifications
- **Socket.IO Integration**: Authenticated WebSocket connections mapped to isolated business and user rooms.
- **Real-Time Events**: Live notification stream for task assignments, invoice payments, and inventory alerts.
- **Toast Notifications**: Interactive alert feed with unread count badges and "Mark All Read" action.

### 📊 Reports & CSV Exports
- **Interactive Visualizations**: Recharts monthly cashflow charts (Revenue vs Expenses bar graph, Net Profit trend line).
- **KPI Metrics**: Collected revenue, pending balances, task throughput velocity, and active project counts.
- **CSV Data Export**: Stream backend-generated CSV files for Invoices, Expenses, Projects, or Inventory.

### 🛡️ SaaS Billing & Super Admin
- **Platform Plans**: Tier gating for Free, Starter, Pro, and Business tiers.
- **Quota Enforcement**: Server-side enforcement preventing team, customer, or project creation beyond subscribed tier limits.
- **Super Admin Control Center**: Platform-wide metrics, tenant directory, user management, and business suspension controls.

### 🌐 Secure Client Portal (`/client/*`)
- **Dedicated Client Experience**: Restricted view for external clients (`client@bizora.demo`).
- **Client Access**: View permitted project milestones, download itemized invoice statements, and retrieve shared deliverables.
- **Strict Data Barrier**: Zero visibility into internal employee rates, operational expenses, or company profit reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7, TanStack Query v5, Zustand, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, Socket.IO, Mongoose, JWT, Bcrypt, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB (with auto-fallback to DevMockDb in-memory engine) |
| **Realtime** | Socket.IO WebSockets with authenticated rooms |
| **Payments** | Stripe & Razorpay webhook abstraction with HMAC verification |

---

## 🔐 Demo Accounts

All demo accounts share the development password: **`Password123!`**

| Role | Email | Workspace / Context | Permissions |
|---|---|---|---|
| **Owner** | `owner@bizora.demo` | Apex Digital Solutions (`biz_apex_101`) | Full workspace & billing access |
| **Manager** | `manager@bizora.demo` | Apex Digital Solutions | Team, projects, customers & ops |
| **Employee** | `employee@bizora.demo` | Apex Digital Solutions | Assigned tasks & deliverables |
| **Client** | `client@bizora.demo` | Client Portal (`/client`) | Permitted projects & invoices only |
| **Super Admin** | `superadmin@bizora.demo` | Platform Super Admin (`/admin`) | Global tenant control & platform MRR |
| **Tenant B Owner** | `nexus@bizora.demo` | Nexus Retail Labs (`biz_nexus_102`) | Isolated Business B workspace |

---

## 💻 Local Setup & Quickstart

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (optional; application runs with full persistence in dual-mode if MongoDB is offline)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Sheshank110/Bizora.git
cd Bizora

# Install monorepo dependencies
npm run install:all
```

### 3. Environment Configuration
```bash
# Copy example environment configuration
cp .env.example .env
```

### 4. Running the Development Servers
```bash
# Start both client and server concurrently
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001/api`
- **API Health**: `http://localhost:5001/api/health`

### 5. Running the Automated End-to-End Test Suite
```bash
cd server
node src/scripts/testFinalValidation.js
```
*Executes the 46-test validation suite verifying authentication, CRM, projects, tasks, invoices, payments, inventory, notifications, reports, subscriptions, client portal, and cross-tenant security.*

### 6. Building for Production
```bash
npm run build
```

---

## 🏛️ Architecture & Tenant Isolation

```text
Incoming HTTP Request / Socket Handshake
                 ↓
[1] Authenticated Session (Bearer JWT access token verified)
                 ↓
[2] Valid Membership Resolution (User is active member in current tenant)
                 ↓
[3] Context Binding (req.business & req.membership attached to request)
                 ↓
[4] RBAC & Feature Permission Check (Required role matches action)
                 ↓
[5] Tenant-Isolated Database Query (Filter: { businessId: req.business._id })
                 ↓
HTTP 200 / 201 Response (or 403 Forbidden / 404 Not Found)
```

For in-depth architectural diagrams and database schemas, see:
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/database-schema.md`](docs/database-schema.md)
- [`docs/api.md`](docs/api.md)
- [`docs/design-system.md`](docs/design-system.md)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
