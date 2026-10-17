# Bizora — Complete System Architecture

## 1. System Overview

**Bizora** is a commercial-grade, multi-tenant Business Management SaaS built with the MERN stack. It enables small to mid-sized businesses to manage their customers, team members, projects, deliverables, services, invoices, payments, expenses, inventory, and cloud documents in a single glassmorphic workspace.

```text
bizora/
├── client/          # React 19 + Vite 8 frontend with TanStack Query & Socket.IO
├── server/          # Node.js + Express + Socket.IO realtime server
├── docs/            # Architecture, Schema, and API specifications
└── package.json     # Monorepo workspaces configuration
```

---

## 2. Multi-Tenancy & Security Model

Multi-tenancy is enforced through a strict five-stage gateway pipeline:

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

### Critical Tenant Isolation Rules:
1. **Never trust client-supplied tenant identifiers**: All queries strictly enforce `{ businessId: req.business._id }` resolved from the cryptographically verified JWT session and membership records.
2. **Cross-Tenant Access Rejection**: Direct URL ID tampering (e.g., User A requesting Invoice B from another business) immediately results in a `404 Not Found` or `403 Forbidden` error without leaking information about the existence of the entity.
3. **Dual-Mode Persistence Guarantee**: The application seamlessly supports live MongoDB alongside an in-memory `DevMockDb` fallback that enforces identical multi-tenant isolation and RBAC checks during local development and testing.

---

## 3. Real-Time Architecture (Socket.IO)

Bizora utilizes Socket.IO for event-driven real-time updates across browsers:

```text
Browser Client
     │ (WebSocket / Polling Handshake with JWT)
     ▼
Socket Authentication Middleware (Verifies User & Workspace Memberships)
     │
     ├── Joins Business Channel: `business:${businessId}`
     └── Joins Personal Channel: `user:${userId}`
```

### Real-Time Event Types:
- `notification:new` — Dispatched when team assignments or mentions occur.
- `payment:received` — Dispatched when a client invoice is settled or webhook triggers.
- `task:assigned` & `task:updated` — Live updates to team Kanban boards.
- `inventory:low` — Broadcast to business managers when stock falls below threshold.

---

## 4. Finance & Payment Webhook Flow

Bizora features a payment provider abstraction supporting Stripe and Razorpay:

```text
Customer Checkout
       ↓
Stripe / Razorpay Payment Gateway
       ↓
POST /api/payments/webhook
       ↓
HMAC Signature Verification (prevents replay and spoofing)
       ↓
Idempotent Check (Provider Transaction ID verified in ledger)
       ↓
Record Payment ({ status: 'SUCCEEDED', amount, currency })
       ↓
Update Invoice State ({ amountPaid, amountDue, status: 'PAID' })
       ↓
Dispatch Notification & Real-Time Socket Broadcast
```

---

## 5. SaaS Billing & Feature Limit Gating

SaaS subscriptions are completely decoupled from customer invoices:
- **Customer Invoices**: Invoices issued *by* the tenant to *their* clients.
- **SaaS Subscriptions**: Invoices issued *to* the tenant for platform access.

### Plan Quota Enforcement:
```text
Action: Add Employee
   ↓
Check: currentCount < plan.limits.employees (e.g., Starter allows 10)
   ├── If within limit: Create employee and increment counter
   └── If limit reached: Reject with 403: "Plan employee limit reached. Please upgrade to Pro."
```

---

## 6. Client Portal Architecture

The Client Portal (`/client/*`) provides a secured, white-labeled client experience:
- Restricted to users with the `CLIENT` membership role.
- Filtered to display only resources where `clientVisible: true` and customer association matches the client account.
- Complete isolation: Clients cannot access internal billing, employee salaries, profit reports, internal audit logs, or other clients' records.

---

## 7. Role-Based Access Control (RBAC) Matrix

| Resource / Action | Owner | Manager | Employee | Client | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Business Settings | Full | View | None | None | Full |
| Team Invitations | Full | Manage | None | None | Read-Only |
| Customers & CRM | Full | Full | Read/Edit | None | Read-Only |
| Projects & Tasks | Full | Full | Assigned | Permitted | Read-Only |
| Services Catalog | Full | Full | View | View | Full |
| Invoices & Billing | Full | Full | Create/View | Pay/Download | Read-Only |
| Payments & Ledger | Full | Full | View | View Own | Read-Only |
| Expenses Management | Full | Full | Create/View | None | None |
| Inventory & Stock | Full | Full | Adjust/View | None | None |
| Financial Reports | Full | Selected | None | None | Platform MRR |
| Audit Logs | Full | Workspace | None | None | Platform-Wide |
| SaaS Tier Upgrade | Full | None | None | None | Full Override |
| Client Portal Views | None | None | None | Full | None |
