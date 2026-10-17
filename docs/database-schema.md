# Bizora — Complete Database Schema & Data Models

## Multi-Tenancy Architecture

**Approach:** Shared Database, Shared Collections with Discriminator Column (`businessId`).

Every business-owned document enforces strict tenant isolation via `businessId` (`ObjectId`, ref `Business`).

Tenant context is derived server-side via `tenantMiddleware` reading the `X-Business-ID` header, which is strictly validated against the user's active `Membership` in that business. Client-supplied body or query parameters for `businessId` are NEVER trusted.

```text
┌─────────────────────────────────────────────────────────────┐
│                           MongoDB                           │
│                                                             │
│   ┌────────────────────┐            ┌────────────────────┐  │
│   │ Business A Tenant  │            │ Business B Tenant  │  │
│   │ - Customers        │            │ - Customers        │  │
│   │ - Employees        │            │ - Employees        │  │
│   │ - Projects & Tasks │            │ - Projects & Tasks │  │
│   │ - Services         │            │ - Services         │  │
│   │ - Invoices         │            │ - Invoices         │  │
│   │ - Payments         │            │ - Payments         │  │
│   │ - Expenses         │            │ - Expenses         │  │
│   │ - Inventory        │            │ - Inventory        │  │
│   │ - Notifications    │            │ - Notifications    │  │
│   │ - Files            │            │ - Files            │  │
│   │ - Audit Logs       │            │ - Audit Logs       │  │
│   └────────────────────┘            └────────────────────┘  │
│             ↑                                 ↑             │
│             └────────────────┬────────────────┘             │
│                              │                              │
│                    businessId filter                        │
│            (Enforced by tenantMiddleware & RBAC)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Complete Relationship Hierarchy

```text
User (Global Account & Platform Roles)
  │
  ├── Membership (User ↔ Business Bridge)
  │      └── Business (Tenant Workspace)
  │             ├── Customers (1:N)
  │             │     ├── CustomerNotes (1:N)
  │             │     └── CustomerActivities (1:N)
  │             ├── EmployeeProfiles (1:1 per Member)
  │             ├── Invitations (Pending Team Invites)
  │             ├── Projects (1:N)
  │             │     └── Tasks (1:N, Kanban Statuses, Checklists)
  │             ├── Services (Service Catalog & Pricing)
  │             ├── Invoices (1:N, Auto-numbering INV-YYYY-XXXX)
  │             │     ├── Line Items (Embed)
  │             │     └── Payments (1:N, Stripe/Razorpay Webhooks)
  │             ├── Expenses (1:N, Category Outlays & Receipts)
  │             ├── Inventory (Physical Stock Tracking)
  │             │     ├── Suppliers (1:N)
  │             │     ├── InventoryItems (SKUs, Thresholds)
  │             │     └── InventoryTransactions (Purchase, Sale, Adjustment)
  │             ├── Notifications (User-targeted Workspace Alerts)
  │             ├── Files (Metadata, Cloud Storage Keys)
  │             ├── AuditLogs (Immutable System Ledger)
  │             └── Subscription (SaaS Plan Gating & Quotas)
  │
  └── Plan (Global SaaS Tiers: Free, Starter, Pro, Business)
```

---

## Data Models Specification

### 1. User
Stores core authentication and cross-workspace identity.
```javascript
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'super_admin'], default: 'user' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  isEmailVerified: { type: Boolean, default: false },
  preferences: { theme: 'system', notifications: { email: true, inApp: true } },
  timestamps: true
}
```

### 2. Business
Represents an isolated multi-tenant organization.
```javascript
{
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  ownerId: { type: ObjectId, ref: 'User', required: true },
  businessCode: { type: String, unique: true },
  plan: { type: String, default: 'starter' },
  status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active' },
  currency: { type: String, default: 'USD' },
  contact: { email: String, phone: String, website: String },
  address: { street: String, city: String, state: String, country: String, postalCode: String },
  timestamps: true
}
```

### 3. Membership
Binds a user to a business with role-based permissions.
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  role: { type: String, enum: ['owner', 'admin', 'manager', 'employee', 'client'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  title: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now },
  timestamps: true
}
```

### 4. Project
Tracks client engagements, deadlines, budgets, and deliverable progress.
```javascript
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  customerId: { type: ObjectId, ref: 'Customer', index: true },
  status: { type: String, enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'], default: 'ACTIVE' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  clientVisible: { type: Boolean, default: true },
  members: [{ type: ObjectId, ref: 'User' }],
  timestamps: true
}
```

### 5. Task
Actionable deliverable assigned within a project or standalone.
```javascript
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  projectId: { type: ObjectId, ref: 'Project', index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], default: 'TODO' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  assignedTo: { type: ObjectId, ref: 'User', index: true },
  dueDate: { type: Date },
  checklist: [{ title: String, completed: Boolean }],
  tags: [String],
  timestamps: true
}
```

### 6. Service
Catalog item for billing and customer scopes.
```javascript
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Development' },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  duration: { type: String, default: '1 week' },
  tax: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  timestamps: true
}
```

### 7. Invoice & InvoiceItem
Professional invoicing with auto-incrementing numbers and payment status tracking.
```javascript
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  invoiceNumber: { type: String, required: true }, // INV-YYYY-XXXX (Unique per business)
  customerId: { type: ObjectId, ref: 'Customer', required: true, index: true },
  projectId: { type: ObjectId, ref: 'Project' },
  items: [{
    serviceId: { type: ObjectId, ref: 'Service' },
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    lineTotal: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  amountDue: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'DRAFT' },
  notes: { type: String, default: '' },
  terms: { type: String, default: '' },
  timestamps: true
}
```

### 8. Payment
Recorded payments from customers, Stripe/Razorpay webhooks.
```javascript
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  invoiceId: { type: ObjectId, ref: 'Invoice', index: true },
  customerId: { type: ObjectId, ref: 'Customer', index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  method: { type: String, enum: ['card', 'bank_transfer', 'upi', 'cash', 'other'], default: 'card' },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED'], default: 'SUCCEEDED' },
  provider: { type: String, default: 'Stripe' },
  providerTransactionId: { type: String },
  reference: { type: String },
  paidAt: { type: Date, default: Date.now },
  timestamps: true
}
```

### 9. Expense
Business operational spending and vendor disbursements.
```javascript
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Office', 'Marketing', 'Travel', 'Software', 'Equipment', 'Salary', 'Utilities', 'Other'], default: 'Other' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  date: { type: Date, default: Date.now },
  vendor: { type: String, default: '' },
  notes: { type: String, default: '' },
  receiptUrl: { type: String, default: '' },
  timestamps: true
}
```

### 10. InventoryItem & InventoryTransaction
Physical stock management, threshold warnings, and immutable stock audit trail.
```javascript
// InventoryItem
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  name: { type: String, required: true },
  sku: { type: String, required: true }, // Unique per business
  category: { type: String, default: 'General' },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  stockQuantity: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 5 },
  location: { type: String, default: 'Main Warehouse' },
  status: { type: String, enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'], default: 'IN_STOCK' },
  timestamps: true
}

// InventoryTransaction
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  itemId: { type: ObjectId, ref: 'InventoryItem', required: true, index: true },
  type: { type: String, enum: ['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'DAMAGE'], required: true },
  quantity: { type: Number, required: true }, // Positive or negative
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: { type: String, default: '' },
  createdBy: { type: ObjectId, ref: 'User' },
  timestamps: true
}
```

### 11. Notification
Targeted alerts dispatched via database and broadcasted live via Socket.IO.
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  type: { type: String, enum: ['TASK_ASSIGNED', 'TASK_DUE_SOON', 'INVOICE_SENT', 'INVOICE_OVERDUE', 'PAYMENT_RECEIVED', 'LOW_STOCK', 'PROJECT_UPDATED', 'EMPLOYEE_INVITED'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  timestamps: true
}
```

### 12. FileRecord
Uploaded file metadata, cloud storage references, and access control tags.
```javascript
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  uploadedBy: { type: ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  mimeType: { type: String, default: 'application/octet-stream' },
  size: { type: Number, default: 0 },
  url: { type: String, required: true },
  storageKey: { type: String },
  entityType: { type: String, enum: ['General', 'Project', 'Task', 'Customer', 'Invoice', 'Expense', 'Inventory'], default: 'General' },
  entityId: { type: ObjectId },
  clientVisible: { type: Boolean, default: false },
  timestamps: true
}
```

### 13. AuditLog
Tamper-resistant audit log capturing all key state mutations.
```javascript
{
  businessId: { type: ObjectId, ref: 'Business', required: true, index: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: ObjectId },
  metadata: { type: Object, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: '' },
  timestamps: true
}
```

### 14. Plan & Subscription
Platform-level SaaS tiers and workspace resource allocations.
```javascript
// Plan
{
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  limits: {
    employees: { type: Number, default: 10 },
    customers: { type: Number, default: 50 },
    projects: { type: Number, default: 25 },
    storageMb: { type: Number, default: 5000 }
  },
  active: { type: Boolean, default: true }
}

// Subscription
{
  businessId: { type: ObjectId, ref: 'Business', required: true, unique: true },
  planSlug: { type: String, required: true, default: 'starter' },
  status: { type: String, enum: ['trial', 'active', 'past_due', 'cancelled', 'expired'], default: 'active' },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  timestamps: true
}
```
