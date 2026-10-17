// Automated Phase 3 Verification Suite
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}/api`;

async function runTests() {
  console.log('🚀 STARTING PHASE 3 VERIFICATION SUITE\n');
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
    // 1. Authenticate Owner of Apex Digital
    console.log('1. Authenticating Apex Owner (owner@bizora.demo)...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@bizora.demo', password: 'Password123!' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.ok && loginData.data?.accessToken, 'Apex Owner login successful');
    const ownerToken = loginData.data?.accessToken;
    const apexBizId = loginData.data?.activeWorkspace?.id || 'biz_apex_101';

    const apexHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ownerToken}`,
      'X-Business-ID': apexBizId
    };

    // 2. Fetch Dashboard Stats
    console.log('\n2. Testing Dashboard Statistics...');
    const dashRes = await fetch(`${BASE_URL}/dashboard/stats`, { headers: apexHeaders });
    const dashData = await dashRes.json();
    assert(dashRes.ok, 'Dashboard stats returned 200');
    assert((dashData.data?.totalCustomers || dashData.data?.customers?.total) >= 15, `Dashboard reports real customer count (${dashData.data?.totalCustomers || dashData.data?.customers?.total})`);
    assert((dashData.data?.activeEmployees || dashData.data?.employees?.active) >= 5, `Dashboard reports active employee count (${dashData.data?.activeEmployees || dashData.data?.employees?.active})`);

    // 3. Customer List, Search, Filter, Pagination
    console.log('\n3. Testing Customer List & Pagination...');
    const custListRes = await fetch(`${BASE_URL}/customers?page=1&limit=5&sortBy=createdAt&sortOrder=desc`, { headers: apexHeaders });
    const custListData = await custListRes.json();
    assert(custListRes.ok, 'Customer list returned 200');
    assert(custListData.data?.length === 5, 'Pagination limit of 5 respected');
    assert(custListData.pagination?.total >= 15, 'Total pagination count accurate');

    console.log('\n4. Testing Customer Search...');
    const searchRes = await fetch(`${BASE_URL}/customers?search=Jonathan`, { headers: apexHeaders });
    const searchData = await searchRes.json();
    assert(searchRes.ok && searchData.data?.some(c => c.firstName === 'Jonathan'), 'Search for "Jonathan" found match');

    console.log('\n5. Testing Customer Filter by Status...');
    const filterRes = await fetch(`${BASE_URL}/customers?status=INACTIVE`, { headers: apexHeaders });
    const filterData = await filterRes.json();
    assert(filterRes.ok && filterData.data?.every(c => c.status === 'INACTIVE'), 'Status filter INACTIVE returned only inactive customers');

    // 4. Create New Customer
    console.log('\n6. Testing Customer Creation...');
    const newCustPayload = {
      firstName: 'Maxwell',
      lastName: 'Sterling',
      email: 'maxwell@sterlingcapital.com',
      phone: '+1 (555) 333-4455',
      company: 'Sterling Capital Ventures',
      jobTitle: 'Managing Partner',
      city: 'Boston',
      state: 'MA',
      country: 'United States',
      tags: ['VIP', 'High Value'],
      source: 'REFERRAL',
      status: 'ACTIVE'
    };
    const createCustRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify(newCustPayload)
    });
    const createCustData = await createCustRes.json();
    assert(createCustRes.ok && createCustData.data?.id, 'Customer created successfully');
    const newCustomerId = createCustData.data?.id || createCustData.data?._id;

    // 5. Update Customer (Assign to employee)
    console.log('\n7. Testing Customer Update & Assignment...');
    const updateRes = await fetch(`${BASE_URL}/customers/${newCustomerId}`, {
      method: 'PATCH',
      headers: apexHeaders,
      body: JSON.stringify({ company: 'Sterling Capital International', status: 'ACTIVE' })
    });
    const updateData = await updateRes.json();
    assert(updateRes.ok && updateData.data?.company === 'Sterling Capital International', 'Customer company updated');

    // 6. Customer Notes
    console.log('\n8. Testing Customer Notes...');
    const addNoteRes = await fetch(`${BASE_URL}/customers/${newCustomerId}/notes`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify({ content: 'Strategic alignment meeting scheduled for next Tuesday.' })
    });
    const addNoteData = await addNoteRes.json();
    assert(addNoteRes.ok && addNoteData.data?.id, 'Note added to customer');
    const noteId = addNoteData.data?.id || addNoteData.data?._id;

    const getNotesRes = await fetch(`${BASE_URL}/customers/${newCustomerId}/notes`, { headers: apexHeaders });
    const getNotesData = await getNotesRes.json();
    assert(getNotesRes.ok && getNotesData.data?.length >= 1, 'Customer notes retrieved successfully');

    // 7. Customer Activity Timeline
    console.log('\n9. Testing Customer Activity Timeline...');
    const actRes = await fetch(`${BASE_URL}/customers/${newCustomerId}/activity`, { headers: apexHeaders });
    const actData = await actRes.json();
    assert(actRes.ok && actData.data?.length >= 2, 'Activity timeline has CREATED and NOTE_ADDED events');

    // 8. Soft Archive Customer
    console.log('\n10. Testing Customer Soft Archive...');
    const archiveRes = await fetch(`${BASE_URL}/customers/${newCustomerId}`, {
      method: 'DELETE',
      headers: apexHeaders
    });
    const archiveData = await archiveRes.json();
    assert(archiveRes.ok && archiveData.data?.status === 'ARCHIVED', 'Customer soft-archived to ARCHIVED status');

    // 9. Employee List & Profile
    console.log('\n11. Testing Employee Directory & Profile...');
    const empListRes = await fetch(`${BASE_URL}/employees`, { headers: apexHeaders });
    const empListData = await empListRes.json();
    assert(empListRes.ok && empListData.data?.length >= 5, 'Employee directory lists all 5 workspace team members');

    const firstEmp = empListData.data?.[1]; // Manager or engineer
    const empId = firstEmp.id || firstEmp._id;
    const empDetailRes = await fetch(`${BASE_URL}/employees/${empId}`, { headers: apexHeaders });
    const empDetailData = await empDetailRes.json();
    assert(empDetailRes.ok && (empDetailData.data?.jobTitle || empDetailData.data?.department), 'Employee profile details returned');

    // 10. Team Invitations Flow
    console.log('\n12. Testing Team Invitations Flow...');
    const inviteRes = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify({
        email: `candidate.${Date.now()}@bizora.demo`,
        role: 'employee'
      })
    });
    const inviteData = await inviteRes.json();
    const inviteToken = inviteData.data?.rawToken || inviteData.data?.token;
    assert(inviteRes.ok && inviteToken, 'Team invitation sent with token');

    // Accept Invitation
    const acceptRes = await fetch(`${BASE_URL}/invitations/${inviteToken}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Marcus',
        lastName: 'Aurelius',
        password: 'Password123!'
      })
    });
    const acceptData = await acceptRes.json();
    assert(acceptRes.ok, 'Invitation accepted and account/membership provisioned');

    // 11. Multi-Tenant Isolation Testing
    console.log('\n13. Testing Tenant Isolation & Resource Protection...');
    // Authenticate Nexus Owner (Nexus Retail Labs)
    const nexusLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nexus@bizora.demo', password: 'Password123!' })
    });
    const nexusLoginData = await nexusLoginRes.json();
    const nexusToken = nexusLoginData.data?.accessToken;
    const nexusBizId = nexusLoginData.data?.activeWorkspace?.id || 'biz_nexus_102';

    const nexusHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${nexusToken}`,
      'X-Business-ID': nexusBizId
    };

    // Apex Owner tries to access Nexus customers
    const crossTenantHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ownerToken}`, // Apex owner
      'X-Business-ID': nexusBizId // Trying to claim Nexus workspace
    };
    const crossTenantRes = await fetch(`${BASE_URL}/customers`, { headers: crossTenantHeaders });
    assert(crossTenantRes.status === 403, `Cross-tenant workspace spoofing denied (Status: ${crossTenantRes.status})`);

    // Apex Owner requests a Nexus customer directly
    // First get a Nexus customer ID using Nexus credentials
    const nexusCustsRes = await fetch(`${BASE_URL}/customers`, { headers: nexusHeaders });
    const nexusCustsData = await nexusCustsRes.json();
    const nexusCustId = nexusCustsData.data?.[0]?.id || nexusCustsData.data?.[0]?._id;

    // Apex Owner tries to fetch Nexus Customer directly
    const directTamperRes = await fetch(`${BASE_URL}/customers/${nexusCustId}`, { headers: apexHeaders });
    assert(directTamperRes.status === 404 || directTamperRes.status === 403, `Cross-tenant direct customer fetch rejected (Status: ${directTamperRes.status})`);

    // 12. Client Role CRM Access Denial
    console.log('\n14. Testing Client Role CRM Access Restriction...');
    // Verify an unauthorized role cannot invite OWNER or access CRM if role is CLIENT
    const badInviteRes = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: apexHeaders,
      body: JSON.stringify({ email: 'hacker@bizora.demo', role: 'OWNER' })
    });
    assert(badInviteRes.status === 400 || badInviteRes.status === 422, `Owner role invitation blocked (Status: ${badInviteRes.status})`);

    console.log(`\n======================================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test suite runtime error:', err);
    process.exit(1);
  }
}

runTests();
