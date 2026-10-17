import crypto from 'crypto';

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}/api`;

async function runValidation() {
  console.log('===============================================================');
  console.log('   BIZORA SAAS — FINAL COMPREHENSIVE VALIDATION SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. Authenticate Business A Owner (Apex Digital Solutions)
    // -------------------------------------------------------------
    console.log('1. [AUTH & TENANCY] Authenticating Apex Digital Owner...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@bizora.demo', password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.ok && loginData.data?.accessToken, 'Apex Owner login successful (token issued)');
    const apexToken = loginData.data?.accessToken;
    const apexBizId = loginData.data?.activeWorkspace?.id || 'biz_apex_101';

    const apexHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apexToken}`,
      'X-Business-ID': apexBizId,
    };

    // -------------------------------------------------------------
    // 2. Milestone 1: Services Catalog
    // -------------------------------------------------------------
    console.log('\n2. [SERVICES] Testing Services Catalog CRUD & Filters...');
    const servicesRes = await fetch(`${BASE_URL}/services`, { headers: apexHeaders });
    const servicesData = await servicesRes.json();
    assert(servicesRes.ok, 'GET /api/services returned 200');
    assert(Array.isArray(servicesData.data) && servicesData.data.length > 0, `Catalog loaded (${servicesData.data?.length} services)`);

    const newServiceRes = await fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify({
        name: 'AI Strategy & Systems Consulting',
        category: 'Consulting',
        price: 3500,
        currency: 'USD',
        duration: '2 weeks',
        tax: 0,
        status: 'ACTIVE',
      }),
    });
    const newServiceData = await newServiceRes.json();
    assert(newServiceRes.ok, `Service created successfully: ${newServiceData.data?.name}`);
    const createdServiceId = newServiceData.data?._id || newServiceData.data?.id;

    // -------------------------------------------------------------
    // 3. Phase 4 Foundation: Projects & Tasks
    // -------------------------------------------------------------
    console.log('\n3. [PROJECTS & TASKS] Testing Projects & Kanban Workflows...');
    const projectsRes = await fetch(`${BASE_URL}/projects`, { headers: apexHeaders });
    const projectsData = await projectsRes.json();
    assert(projectsRes.ok, 'GET /api/projects returned 200');
    assert(projectsData.data?.length > 0, `Projects retrieved (${projectsData.data?.length} projects)`);

    const activeProject = projectsData.data[0];
    const projectId = activeProject._id || activeProject.id;

    // Create task under this project
    const newTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify({
        title: 'Review production deployment checklist',
        projectId,
        priority: 'URGENT',
        status: 'TODO',
      }),
    });
    const newTaskData = await newTaskRes.json();
    assert(newTaskRes.ok, `Task created: "${newTaskData.data?.title}"`);
    const taskId = newTaskData.data?._id || newTaskData.data?.id;

    // Move task status to IN_PROGRESS and then DONE
    const updateTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: apexHeaders,
      body: JSON.stringify({ status: 'DONE' }),
    });
    const updateTaskData = await updateTaskRes.json();
    assert(updateTaskRes.ok && updateTaskData.data?.status === 'DONE', 'Task status transitioned to DONE');

    // -------------------------------------------------------------
    // 4. Milestone 2: Invoices & Automatic Numbering
    // -------------------------------------------------------------
    console.log('\n4. [INVOICES] Testing Invoice Creation, Line Items, & Numbering...');
    const invoicesRes = await fetch(`${BASE_URL}/invoices`, { headers: apexHeaders });
    const invoicesData = await invoicesRes.json();
    assert(invoicesRes.ok, 'GET /api/invoices returned 200');
    assert(invoicesData.data?.length > 0, `Invoices retrieved (${invoicesData.data?.length} invoices)`);

    // Create a new invoice
    const newInvoiceRes = await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify({
        customerId: activeProject.customerId?._id || activeProject.customerId || 'cust_101',
        projectId,
        items: [
          { description: 'Cloud Architecture Implementation', quantity: 1, unitPrice: 2400, tax: 0, discount: 0 },
          { description: 'Security Hardening Audit', quantity: 2, unitPrice: 800, tax: 0, discount: 0 },
        ],
        notes: 'Net 14 payment terms',
      }),
    });
    const newInvoiceData = await newInvoiceRes.json();
    assert(newInvoiceRes.ok, 'Invoice created with 2 line items');
    assert(newInvoiceData.data?.invoiceNumber?.startsWith('INV-'), `Secure invoice number generated: ${newInvoiceData.data?.invoiceNumber}`);
    assert(newInvoiceData.data?.total === 4000, `Invoice calculated subtotal + total correctly ($${newInvoiceData.data?.total})`);
    const newInvoiceId = newInvoiceData.data?._id || newInvoiceData.data?.id;

    // Mark invoice as paid
    const markPaidRes = await fetch(`${BASE_URL}/invoices/${newInvoiceId}/mark-paid`, {
      method: 'POST',
      headers: apexHeaders,
    });
    const markPaidData = await markPaidRes.json();
    assert(markPaidRes.ok && markPaidData.data?.status === 'PAID', 'Invoice transitioned to status PAID');

    // -------------------------------------------------------------
    // 5. Milestone 3: Payments & Expenses
    // -------------------------------------------------------------
    console.log('\n5. [PAYMENTS & EXPENSES] Testing Payment Tracking & Ledger...');
    const paymentsRes = await fetch(`${BASE_URL}/payments`, { headers: apexHeaders });
    const paymentsData = await paymentsRes.json();
    assert(paymentsRes.ok, 'GET /api/payments returned 200');
    assert(paymentsData.data?.length > 0, `Payments ledger retrieved (${paymentsData.data?.length} records)`);

    const newExpenseRes = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify({
        title: 'Vercel Enterprise Team License',
        category: 'Software',
        amount: 350,
        vendor: 'Vercel Inc.',
        date: new Date().toISOString(),
      }),
    });
    const newExpenseData = await newExpenseRes.json();
    assert(newExpenseRes.ok && newExpenseData.data?.amount === 350, `Expense recorded: ${newExpenseData.data?.title} ($${newExpenseData.data?.amount})`);

    // -------------------------------------------------------------
    // 6. Milestone 4: Inventory & Stock Adjustments
    // -------------------------------------------------------------
    console.log('\n6. [INVENTORY] Testing Inventory & Stock Transactions...');
    const inventoryRes = await fetch(`${BASE_URL}/inventory`, { headers: apexHeaders });
    const inventoryData = await inventoryRes.json();
    assert(inventoryRes.ok, 'GET /api/inventory returned 200');
    assert(inventoryData.data?.length > 0, `Inventory items retrieved (${inventoryData.data?.length} SKUs)`);

    const firstItem = inventoryData.data[0];
    const initialStock = firstItem.stockQuantity;

    // Perform stock adjustment
    const adjustRes = await fetch(`${BASE_URL}/inventory/${firstItem._id || firstItem.id}/adjust`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify({
        type: 'PURCHASE',
        quantity: 5,
        notes: 'Replenishment order received',
      }),
    });
    const adjustData = await adjustRes.json();
    assert(adjustRes.ok, 'Stock adjustment transaction executed');
    const newStockVal = adjustData.data?.item?.stockQuantity ?? adjustData.data?.stockQuantity;
    assert(newStockVal === initialStock + 5, `Stock updated accurately (${initialStock} -> ${newStockVal})`);

    // Verify transaction history
    const txRes = await fetch(`${BASE_URL}/inventory/${firstItem._id || firstItem.id}/transactions`, { headers: apexHeaders });
    const txData = await txRes.json();
    const transactions = txData.data || [];
    assert(txRes.ok && Array.isArray(transactions), 'Inventory transaction audit history retrieved');

    // -------------------------------------------------------------
    // 7. Milestone 5: Notifications & Realtime
    // -------------------------------------------------------------
    console.log('\n7. [NOTIFICATIONS] Testing Notifications Stream...');
    const notifsRes = await fetch(`${BASE_URL}/notifications`, { headers: apexHeaders });
    const notifsData = await notifsRes.json();
    const notifsList = notifsData.data?.notifications || notifsData.data || [];
    assert(notifsRes.ok, 'GET /api/notifications returned 200');
    assert(notifsList.length > 0, `Notifications list retrieved (${notifsList.length} alerts)`);

    const markAllReadRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'POST',
      headers: apexHeaders,
    });
    assert(markAllReadRes.ok, 'POST /api/notifications/read-all returned 200');

    // -------------------------------------------------------------
    // 8. Milestone 6: Files & Immutable Audit Logs
    // -------------------------------------------------------------
    console.log('\n8. [FILES & AUDIT] Testing File Storage Metadata & Activity Log...');
    const filesRes = await fetch(`${BASE_URL}/files`, { headers: apexHeaders });
    const filesData = await filesRes.json();
    assert(filesRes.ok, 'GET /api/files returned 200');
    assert(filesData.data?.length > 0, `Files repository retrieved (${filesData.data?.length} records)`);

    const auditRes = await fetch(`${BASE_URL}/audit-logs`, { headers: apexHeaders });
    const auditData = await auditRes.json();
    assert(auditRes.ok, 'GET /api/audit-logs returned 200');
    assert(auditData.data?.length > 0, `Audit logs retrieved (${auditData.data?.length} audit events)`);

    // -------------------------------------------------------------
    // 9. Milestone 7: Analytics & CSV Reports
    // -------------------------------------------------------------
    console.log('\n9. [REPORTS] Testing Analytics Aggregations & CSV Export...');
    const reportRes = await fetch(`${BASE_URL}/reports/summary`, { headers: apexHeaders });
    const reportData = await reportRes.json();
    assert(reportRes.ok, 'GET /api/reports/summary returned 200');
    const totalRev = reportData.data?.financial?.totalRevenue ?? reportData.data?.financials?.totalRevenue;
    assert(totalRev !== undefined, `Report aggregates revenue: $${totalRev}`);
    const monthlyList = reportData.data?.monthlyBreakdown || reportData.data?.monthlyData || [];
    assert(Array.isArray(monthlyList) && monthlyList.length > 0, 'Monthly analytics breakdown computed for charts');

    const csvRes = await fetch(`${BASE_URL}/reports/export?type=invoices`, { headers: apexHeaders });
    assert(csvRes.ok && csvRes.headers.get('content-type')?.includes('text/csv'), 'GET /api/reports/export returned valid CSV attachment stream');

    // -------------------------------------------------------------
    // 10. Milestone 8: SaaS Subscriptions & Platform Admin
    // -------------------------------------------------------------
    console.log('\n10. [SAAS BILLING & ADMIN] Testing Subscription & Super Admin...');
    const subRes = await fetch(`${BASE_URL}/subscription`, { headers: apexHeaders });
    const subData = await subRes.json();
    assert(subRes.ok, 'GET /api/subscription returned 200');
    const planVal = subData.data?.plan || subData.data?.subscription?.planSlug;
    assert(planVal !== undefined, `Current workspace plan: ${planVal}`);

    // Authenticate Super Admin
    const superAdminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@bizora.demo', password: 'Password123!' }),
    });
    const superAdminLogin = await superAdminLoginRes.json();
    assert(superAdminLoginRes.ok && (superAdminLogin.data?.user?.role === 'super_admin' || superAdminLogin.data?.user?.isSuperAdmin), 'Super Admin authenticated with platform privileges');

    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminLogin.data?.accessToken}`,
    };

    const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, { headers: adminHeaders });
    const adminDash = await adminDashRes.json();
    assert(adminDashRes.ok, 'Super Admin Dashboard metrics returned 200');
    assert(adminDash.data?.totalBusinesses >= 2, `Platform oversees ${adminDash.data?.totalBusinesses} registered tenant businesses`);

    // -------------------------------------------------------------
    // 11. Milestone 9: Client Portal Isolated Access
    // -------------------------------------------------------------
    console.log('\n11. [CLIENT PORTAL] Testing Client Authentication & Restricted Views...');
    const clientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@bizora.demo', password: 'Password123!' }),
    });
    const clientLogin = await clientLoginRes.json();
    assert(clientLoginRes.ok && clientLogin.data?.user?.email === 'client@bizora.demo', 'Client authenticated successfully');

    const clientHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientLogin.data?.accessToken}`,
      'X-Business-ID': apexBizId,
    };

    const clientDashRes = await fetch(`${BASE_URL}/client/dashboard`, { headers: clientHeaders });
    const clientDash = await clientDashRes.json();
    assert(clientDashRes.ok, 'Client Portal Dashboard returned 200');

    const clientProjectsRes = await fetch(`${BASE_URL}/client/projects`, { headers: clientHeaders });
    const clientProjects = await clientProjectsRes.json();
    assert(clientProjectsRes.ok, 'Client retrieved permitted projects view');

    const clientInvoicesRes = await fetch(`${BASE_URL}/client/invoices`, { headers: clientHeaders });
    const clientInvoices = await clientInvoicesRes.json();
    assert(clientInvoicesRes.ok, 'Client retrieved permitted invoices list');

    // -------------------------------------------------------------
    // 12. Milestone 10: Strict Cross-Tenant Isolation Enforcement
    // -------------------------------------------------------------
    console.log('\n12. [SECURITY & CROSS-TENANT ISOLATION] Testing Cross-Tenant Rejection...');
    // Authenticate Tenant B Owner (Nexus Retail Labs)
    const nexusLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nexus@bizora.demo', password: 'Password123!' }),
    });
    const nexusLogin = await nexusLoginRes.json();
    assert(nexusLoginRes.ok, 'Tenant B (Nexus Retail Labs) authenticated');

    const nexusHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${nexusLogin.data?.accessToken}`,
      'X-Business-ID': 'biz_nexus_102',
    };

    // Attempt 1: Tenant B attempting to fetch Apex Digital's private project by ID
    const crossProjectRes = await fetch(`${BASE_URL}/projects/${projectId}`, { headers: nexusHeaders });
    assert(crossProjectRes.status === 404 || crossProjectRes.status === 403, `Cross-tenant project access rejected with status ${crossProjectRes.status}`);

    // Attempt 2: Tenant B attempting to fetch Apex Digital's invoice
    const crossInvoiceRes = await fetch(`${BASE_URL}/invoices/${newInvoiceId}`, { headers: nexusHeaders });
    assert(crossInvoiceRes.status === 404 || crossInvoiceRes.status === 403, `Cross-tenant invoice access rejected with status ${crossInvoiceRes.status}`);

    // Attempt 3: Regular user attempting to access Super Admin dashboard
    const unauthorizedAdminRes = await fetch(`${BASE_URL}/admin/dashboard`, { headers: apexHeaders });
    assert(unauthorizedAdminRes.status === 403, `Unauthorized user blocked from /admin/dashboard with 403 Forbidden`);

    console.log('\n===============================================================');
    console.log(`VALIDATION FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Validation script exception:', err);
    process.exit(1);
  }
}

runValidation();
