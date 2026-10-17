import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { USER_ROLES, MEMBERSHIP_STATUS } from '../constants/index.js';
import { getFinalSeedData } from './devMockDbData.js';

class DevMockDb {
  constructor() {
    this.users = [];
    this.businesses = [];
    this.memberships = [];
    this.customers = [];
    this.customerNotes = [];
    this.customerActivities = [];
    this.employeeProfiles = [];
    this.invitations = [];
    this.projects = [];
    this.tasks = [];
    this.services = [];
    this.invoices = [];
    this.payments = [];
    this.expenses = [];
    this.suppliers = [];
    this.inventoryItems = [];
    this.inventoryTransactions = [];
    this.notifications = [];
    this.files = [];
    this.auditLogs = [];
    this.plans = [];
    this.subscriptions = [];
    this.initialized = false;
    this.init();
  }

  async init() {
    if (this.initialized) return;

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // ─── Apex Digital Solutions Users ────────────────────
    const ownerId = 'usr_owner_001';
    const managerId = 'usr_mgr_002';
    const employeeId = 'usr_emp_003';
    const mayaId = 'usr_emp_005';
    const marcusId = 'usr_emp_006';
    const sheshankId = 'usr_sheshank_001';

    // ─── Nexus Retail Labs Users ─────────────────────────
    const nexusOwnerId = 'usr_nex_004';
    const liamId = 'usr_nex_007';
    const chloeId = 'usr_nex_008';
    const jordanId = 'usr_nex_009';

    const apexBizId = 'biz_apex_101';
    const nexusBizId = 'biz_nexus_102';

    this.users = [
      {
        _id: ownerId,
        id: ownerId,
        firstName: 'Alex',
        lastName: 'Morgan',
        fullName: 'Alex Morgan',
        email: 'owner@bizora.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 234-5678',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'dark', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-01-10'),
      },
      {
        _id: sheshankId,
        id: sheshankId,
        firstName: 'Sheshank',
        lastName: 'Gahlawat',
        fullName: 'Sheshank Gahlawat',
        email: 'sheshankgahlawat2428@gmail.com',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 000-1122',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'dark', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-01-10'),
      },
      {
        _id: managerId,
        id: managerId,
        firstName: 'Sarah',
        lastName: 'Chen',
        fullName: 'Sarah Chen',
        email: 'manager@bizora.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 876-5432',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'system', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-01-12'),
      },
      {
        _id: employeeId,
        id: employeeId,
        firstName: 'David',
        lastName: 'Kim',
        fullName: 'David Kim',
        email: 'employee@bizora.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 345-6789',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'light', notifications: { email: false, inApp: true } },
        createdAt: new Date('2026-01-15'),
      },
      {
        _id: mayaId,
        id: mayaId,
        firstName: 'Maya',
        lastName: 'Patel',
        fullName: 'Maya Patel',
        email: 'maya@bizora.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 432-1098',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'dark', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-02-01'),
      },
      {
        _id: marcusId,
        id: marcusId,
        firstName: 'Marcus',
        lastName: 'Vance',
        fullName: 'Marcus Vance',
        email: 'marcus@bizora.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 654-3210',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'system', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-02-15'),
      },
      // Nexus users
      {
        _id: nexusOwnerId,
        id: nexusOwnerId,
        firstName: 'Elena',
        lastName: 'Rostova',
        fullName: 'Elena Rostova',
        email: 'nexus@bizora.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 999-0000',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'dark', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-01-05'),
      },
      {
        _id: liamId,
        id: liamId,
        firstName: 'Liam',
        lastName: "O'Connor",
        fullName: "Liam O'Connor",
        email: 'liam@nexusretail.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 888-1111',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'system', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-01-20'),
      },
      {
        _id: chloeId,
        id: chloeId,
        firstName: 'Chloe',
        lastName: 'Bennett',
        fullName: 'Chloe Bennett',
        email: 'chloe@nexusretail.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 777-2222',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'light', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-02-01'),
      },
      {
        _id: jordanId,
        id: jordanId,
        firstName: 'Jordan',
        lastName: 'Taylor',
        fullName: 'Jordan Taylor',
        email: 'jordan@nexusretail.demo',
        password: hashedPassword,
        avatar: '',
        phone: '+1 (555) 666-3333',
        status: 'active',
        isEmailVerified: true,
        refreshTokens: [],
        preferences: { theme: 'dark', notifications: { email: true, inApp: true } },
        createdAt: new Date('2026-02-10'),
      },
    ];

    this.businesses = [
      {
        _id: apexBizId,
        id: apexBizId,
        name: 'Apex Digital Solutions',
        slug: 'apex-digital-solutions',
        ownerId: ownerId,
        industry: 'technology',
        currency: 'USD',
        timezone: 'America/New_York',
        description: 'Full-service digital product engineering and enterprise consulting firm.',
        address: {
          street: '100 Innovation Blvd, Suite 400',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'United States',
        },
        contact: {
          email: 'contact@apexdigital.demo',
          phone: '+1 (555) 100-2000',
          website: 'https://apexdigital.demo',
        },
        taxId: 'US-987654321',
        plan: 'pro',
        status: 'active',
        createdAt: new Date('2026-01-10'),
      },
      {
        _id: nexusBizId,
        id: nexusBizId,
        name: 'Nexus Retail Labs',
        slug: 'nexus-retail-labs',
        ownerId: nexusOwnerId,
        industry: 'retail',
        currency: 'USD',
        timezone: 'America/Chicago',
        description: 'Next-generation omni-channel retail supply and boutique logistics.',
        address: {
          street: '450 Michigan Ave',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60611',
          country: 'United States',
        },
        contact: {
          email: 'hello@nexusretail.demo',
          phone: '+1 (555) 450-8800',
          website: 'https://nexusretail.demo',
        },
        taxId: 'US-112233445',
        plan: 'starter',
        status: 'active',
        createdAt: new Date('2026-01-05'),
      },
    ];

    this.memberships = [
      // Apex Memberships
      {
        _id: 'mem_1',
        userId: ownerId,
        businessId: apexBizId,
        role: USER_ROLES.OWNER,
        title: 'Founder & CEO',
        department: 'Executive',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-01-10'),
      },
      {
        _id: 'mem_sheshank',
        userId: sheshankId,
        businessId: apexBizId,
        role: USER_ROLES.OWNER,
        title: 'Founder & CEO',
        department: 'Executive',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-01-10'),
      },
      {
        _id: 'mem_2',
        userId: managerId,
        businessId: apexBizId,
        role: USER_ROLES.MANAGER,
        title: 'Operations Director',
        department: 'Operations',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-01-12'),
      },
      {
        _id: 'mem_3',
        userId: employeeId,
        businessId: apexBizId,
        role: USER_ROLES.EMPLOYEE,
        title: 'Senior Full Stack Engineer',
        department: 'Engineering',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-01-15'),
      },
      {
        _id: 'mem_5',
        userId: mayaId,
        businessId: apexBizId,
        role: USER_ROLES.EMPLOYEE,
        title: 'Lead UI/UX Product Designer',
        department: 'Design',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-02-01'),
      },
      {
        _id: 'mem_6',
        userId: marcusId,
        businessId: apexBizId,
        role: USER_ROLES.EMPLOYEE,
        title: 'Client Success Specialist',
        department: 'Support',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-02-15'),
      },

      // Nexus Memberships
      {
        _id: 'mem_4',
        userId: nexusOwnerId,
        businessId: nexusBizId,
        role: USER_ROLES.OWNER,
        title: 'Managing Director',
        department: 'Executive',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-01-05'),
      },
      {
        _id: 'mem_7',
        userId: liamId,
        businessId: nexusBizId,
        role: USER_ROLES.MANAGER,
        title: 'Supply Chain Lead',
        department: 'Operations',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-01-20'),
      },
      {
        _id: 'mem_8',
        userId: chloeId,
        businessId: nexusBizId,
        role: USER_ROLES.EMPLOYEE,
        title: 'Inventory Specialist',
        department: 'Warehouse',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-02-01'),
      },
      {
        _id: 'mem_9',
        userId: jordanId,
        businessId: nexusBizId,
        role: USER_ROLES.EMPLOYEE,
        title: 'Retail Merchandiser',
        department: 'Sales',
        status: MEMBERSHIP_STATUS.ACTIVE,
        joinedAt: new Date('2026-02-10'),
      },
    ];

    // ─── Employee Profiles ──────────────────────────────
    this.employeeProfiles = [
      {
        _id: 'emp_p_1',
        userId: ownerId,
        businessId: apexBizId,
        jobTitle: 'Founder & CEO',
        department: 'Executive',
        phone: '+1 (555) 234-5678',
        employeeCode: 'APEX-001',
        joiningDate: new Date('2026-01-10'),
        bio: 'Leading strategic direction and architectural execution for client ventures.',
        status: 'ACTIVE',
      },
      {
        _id: 'emp_p_2',
        userId: managerId,
        businessId: apexBizId,
        jobTitle: 'Operations Director',
        department: 'Operations',
        phone: '+1 (555) 876-5432',
        employeeCode: 'APEX-002',
        joiningDate: new Date('2026-01-12'),
        bio: 'Managing cross-functional sprint deliveries and client lifecycle operations.',
        status: 'ACTIVE',
      },
      {
        _id: 'emp_p_3',
        userId: employeeId,
        businessId: apexBizId,
        jobTitle: 'Senior Full Stack Engineer',
        department: 'Engineering',
        phone: '+1 (555) 345-6789',
        employeeCode: 'APEX-003',
        joiningDate: new Date('2026-01-15'),
        bio: 'Full-stack cloud applications, reactive frontend architectures, and high-load APIs.',
        status: 'ACTIVE',
      },
      {
        _id: 'emp_p_4',
        userId: mayaId,
        businessId: apexBizId,
        jobTitle: 'Lead UI/UX Product Designer',
        department: 'Design',
        phone: '+1 (555) 432-1098',
        employeeCode: 'APEX-004',
        joiningDate: new Date('2026-02-01'),
        bio: 'Creating design systems, glassmorphism UI interfaces, and delightful mobile UX.',
        status: 'ACTIVE',
      },
      {
        _id: 'emp_p_5',
        userId: marcusId,
        businessId: apexBizId,
        jobTitle: 'Client Success Specialist',
        department: 'Support',
        phone: '+1 (555) 654-3210',
        employeeCode: 'APEX-005',
        joiningDate: new Date('2026-02-15'),
        bio: 'Ensuring customer onboarding milestones and long-term account health.',
        status: 'ACTIVE',
      },
      // Nexus employee profiles
      {
        _id: 'emp_p_6',
        userId: nexusOwnerId,
        businessId: nexusBizId,
        jobTitle: 'Managing Director',
        department: 'Executive',
        phone: '+1 (555) 999-0000',
        employeeCode: 'NEX-001',
        joiningDate: new Date('2026-01-05'),
        bio: 'Retail logistics and commercial distribution executive.',
        status: 'ACTIVE',
      },
      {
        _id: 'emp_p_7',
        userId: liamId,
        businessId: nexusBizId,
        jobTitle: 'Supply Chain Lead',
        department: 'Operations',
        phone: '+1 (555) 888-1111',
        employeeCode: 'NEX-002',
        joiningDate: new Date('2026-01-20'),
        bio: 'Inventory flow, supplier negotiations, and fulfillment routing.',
        status: 'ACTIVE',
      },
      {
        _id: 'emp_p_8',
        userId: chloeId,
        businessId: nexusBizId,
        jobTitle: 'Inventory Specialist',
        department: 'Warehouse',
        phone: '+1 (555) 777-2222',
        employeeCode: 'NEX-003',
        joiningDate: new Date('2026-02-01'),
        bio: 'SKU categorization, batch tracking, and warehouse quality checks.',
        status: 'ACTIVE',
      },
      {
        _id: 'emp_p_9',
        userId: jordanId,
        businessId: nexusBizId,
        jobTitle: 'Retail Merchandiser',
        department: 'Sales',
        phone: '+1 (555) 666-3333',
        employeeCode: 'NEX-004',
        joiningDate: new Date('2026-02-10'),
        bio: 'Storefront presentation, customer demand analysis, and product placements.',
        status: 'ACTIVE',
      },
    ];

    // ─── Invitations ────────────────────────────────────
    this.invitations = [
      {
        _id: 'inv_apex_01',
        businessId: apexBizId,
        email: 'candidate.dev@example.com',
        role: 'employee',
        jobTitle: 'Backend Engineer',
        department: 'Engineering',
        invitedBy: ownerId,
        token: crypto.createHash('sha256').update('apex_sample_token_123').digest('hex'),
        expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        createdAt: new Date(),
      },
    ];

    // ─── Apex Digital Solutions Customers (16 Records) ──
    const apexCustomersRaw = [
      {
        firstName: 'Jonathan',
        lastName: 'Sterling',
        email: 'j.sterling@sterlingmedia.com',
        phone: '+1 (212) 555-0143',
        company: 'Sterling Global Media',
        jobTitle: 'Chief Marketing Officer',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        tags: ['VIP', 'Enterprise', 'High Value'],
        status: 'ACTIVE',
        source: 'REFERRAL',
        assignedEmployee: managerId,
        notesSummary: 'High priority media partner. Negotiating annual enterprise retainer.',
      },
      {
        firstName: 'Amara',
        lastName: 'Okafor',
        email: 'amara@pulsehealth.io',
        phone: '+1 (415) 555-0891',
        company: 'Pulse Healthcare Systems',
        jobTitle: 'Director of Digital Products',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        tags: ['High Value', 'Returning'],
        status: 'ACTIVE',
        source: 'WEBSITE',
        assignedEmployee: employeeId,
        notesSummary: 'Health platform overhaul. Initial discovery call went very well.',
      },
      {
        firstName: 'Marcus',
        lastName: 'Brody',
        email: 'mbrody@brodycapital.com',
        phone: '+1 (312) 555-0321',
        company: 'Brody Capital Partners',
        jobTitle: 'Managing Partner',
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        tags: ['VIP', 'Financial'],
        status: 'ACTIVE',
        source: 'REFERRAL',
        assignedEmployee: ownerId,
        notesSummary: 'Executive portal dashboard. Bi-weekly review scheduled on Tuesdays.',
      },
      {
        firstName: 'Elena',
        lastName: 'Vasquez',
        email: 'elena@solarpulse.energy',
        phone: '+1 (512) 555-0764',
        company: 'SolarPulse Renewable Energy',
        jobTitle: 'VP Technology',
        city: 'Austin',
        state: 'TX',
        country: 'United States',
        tags: ['Lead', 'CleanTech'],
        status: 'ACTIVE',
        source: 'ADVERTISEMENT',
        assignedEmployee: mayaId,
        notesSummary: 'Evaluating proposal for real-time solar battery telemetry portal.',
      },
      {
        firstName: 'Hiroshi',
        lastName: 'Tanaka',
        email: 'tanaka@novabotics.jp',
        phone: '+1 (206) 555-0912',
        company: 'NovaBotics Robotics',
        jobTitle: 'Head of Engineering',
        city: 'Seattle',
        state: 'WA',
        country: 'United States',
        tags: ['Enterprise', 'Robotics'],
        status: 'ACTIVE',
        source: 'SOCIAL_MEDIA',
        assignedEmployee: employeeId,
        notesSummary: 'Firmware dashboard app. Integration testing in sandbox underway.',
      },
      {
        firstName: 'Sophie',
        lastName: 'Dubois',
        email: 'sophie@lumiereluxury.fr',
        phone: '+1 (305) 555-0239',
        company: 'Lumière Hospitality Group',
        jobTitle: 'Creative Director',
        city: 'Miami',
        state: 'FL',
        country: 'United States',
        tags: ['VIP', 'Hospitality'],
        status: 'ACTIVE',
        source: 'PHONE',
        assignedEmployee: mayaId,
        notesSummary: 'Boutique hotel booking engine redesign. Approved visual direction.',
      },
      {
        firstName: 'Daniel',
        lastName: 'Kovacs',
        email: 'dkovacs@hypercloud.net',
        phone: '+1 (617) 555-0452',
        company: 'HyperCloud Infrastructure',
        jobTitle: 'VP Operations',
        city: 'Boston',
        state: 'MA',
        country: 'United States',
        tags: ['Technical', 'Returning'],
        status: 'ACTIVE',
        source: 'EMAIL',
        assignedEmployee: managerId,
        notesSummary: 'Multi-cloud optimization consulting. Looking to renew Q3 contract.',
      },
      {
        firstName: 'Chloe',
        lastName: 'Simmons',
        email: 'chloe@urbanbloom.co',
        phone: '+1 (503) 555-0678',
        company: 'Urban Bloom Organics',
        jobTitle: 'E-commerce Lead',
        city: 'Portland',
        state: 'OR',
        country: 'United States',
        tags: ['Lead', 'Retail'],
        status: 'INACTIVE',
        source: 'WEBSITE',
        assignedEmployee: marcusId,
        notesSummary: 'Pausing migration until next fiscal cycle begins in August.',
      },
      {
        firstName: 'Tariq',
        lastName: 'Al-Mansoor',
        email: 'tariq@vertexlogistics.ae',
        phone: '+1 (713) 555-0845',
        company: 'Vertex Freight Systems',
        jobTitle: 'Logistics Director',
        city: 'Houston',
        state: 'TX',
        country: 'United States',
        tags: ['Enterprise', 'SupplyChain'],
        status: 'ACTIVE',
        source: 'WALK_IN',
        assignedEmployee: managerId,
        notesSummary: 'Fleet route optimization service. In need of custom dispatch dashboard.',
      },
      {
        firstName: 'Rachel',
        lastName: 'Greenberg',
        email: 'rachel@beaconfintech.com',
        phone: '+1 (212) 555-0982',
        company: 'Beacon FinTech Ventures',
        jobTitle: 'Founder',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        tags: ['VIP', 'Fintech', 'High Value'],
        status: 'ACTIVE',
        source: 'REFERRAL',
        assignedEmployee: ownerId,
        notesSummary: 'White-label mobile wallet application. Phase 1 delivered on schedule.',
      },
      {
        firstName: 'Lucas',
        lastName: 'Moretti',
        email: 'lucas@craftbrews.it',
        phone: '+1 (303) 555-0129',
        company: 'Alpine Crest Brewing Co.',
        jobTitle: 'General Manager',
        city: 'Denver',
        state: 'CO',
        country: 'United States',
        tags: ['Local', 'Food & Beverage'],
        status: 'ACTIVE',
        source: 'REFERRAL',
        assignedEmployee: marcusId,
        notesSummary: 'Direct-to-consumer subscription club website and loyalty rewards.',
      },
      {
        firstName: 'Aaliyah',
        lastName: 'Washington',
        email: 'aaliyah@eduleap.org',
        phone: '+1 (202) 555-0431',
        company: 'EduLeap Learning Academy',
        jobTitle: 'Program Director',
        city: 'Washington',
        state: 'DC',
        country: 'United States',
        tags: ['Education', 'Returning'],
        status: 'ACTIVE',
        source: 'OTHER',
        assignedEmployee: employeeId,
        notesSummary: 'Learning management system customization for K-12 STEM charter schools.',
      },
      {
        firstName: 'Nathan',
        lastName: 'Drake',
        email: 'nathan@unchartedmedia.com',
        phone: '+1 (310) 555-0720',
        company: 'Uncharted Interactive Studios',
        jobTitle: 'Executive Producer',
        city: 'Los Angeles',
        state: 'CA',
        country: 'United States',
        tags: ['Media', 'Gaming'],
        status: 'INACTIVE',
        source: 'WEBSITE',
        assignedEmployee: mayaId,
        notesSummary: 'Interactive web teaser experience. Project closed successfully last month.',
      },
      {
        firstName: 'Zoya',
        lastName: 'Petrova',
        email: 'zoya@biogenixlab.ch',
        phone: '+1 (619) 555-0814',
        company: 'BioGenix Diagnostics',
        jobTitle: 'Clinical Operations Head',
        city: 'San Diego',
        state: 'CA',
        country: 'United States',
        tags: ['Biotech', 'High Value'],
        status: 'ACTIVE',
        source: 'REFERRAL',
        assignedEmployee: managerId,
        notesSummary: 'Lab sample management portal with HIPAA compliance tracking.',
      },
      {
        firstName: 'Arthur',
        lastName: 'Pendleton',
        email: 'arthur@pendletonlaw.co.uk',
        phone: '+1 (404) 555-0377',
        company: 'Pendleton Legal Associates',
        jobTitle: 'Senior Partner',
        city: 'Atlanta',
        state: 'GA',
        country: 'United States',
        tags: ['Legal', 'Archived'],
        status: 'ARCHIVED',
        source: 'PHONE',
        assignedEmployee: marcusId,
        notesSummary: 'Account archived after firm merger completed in December.',
      },
      {
        firstName: 'Grace',
        lastName: 'Hopperfield',
        email: 'grace@quantumleap.ai',
        phone: '+1 (408) 555-0555',
        company: 'QuantumLeap AI Labs',
        jobTitle: 'Chief Scientist',
        city: 'San Jose',
        state: 'CA',
        country: 'United States',
        tags: ['VIP', 'AI', 'High Value'],
        status: 'ACTIVE',
        source: 'WEBSITE',
        assignedEmployee: ownerId,
        notesSummary: 'Strategic generative workflow engine for predictive marketing analytics.',
      },
    ];

    this.customers = apexCustomersRaw.map((c, idx) => ({
      _id: `cust_apex_${100 + idx}`,
      id: `cust_apex_${100 + idx}`,
      businessId: apexBizId,
      ...c,
      createdBy: ownerId,
      address: {
        street: `${100 + idx * 12} Enterprise Way`,
        city: c.city,
        state: c.state,
        country: c.country,
        postalCode: `100${idx < 10 ? '0' + idx : idx}`,
      },
      createdAt: new Date(Date.now() - (idx + 1) * 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000),
    }));

    // ─── Nexus Retail Labs Customers (11 Records) ────────
    const nexusCustomersRaw = [
      {
        firstName: 'Victoria',
        lastName: 'Cross',
        email: 'victoria@nordicboutique.com',
        phone: '+1 (312) 555-1010',
        company: 'Nordic Boutique Collective',
        tags: ['Retail', 'Wholesale', 'VIP'],
        status: 'ACTIVE',
        assignedEmployee: liamId,
        notesSummary: 'Boutique knitwear supplier. Order shipment arriving every Thursday.',
      },
      {
        firstName: 'Samir',
        lastName: 'Bansal',
        email: 'samir@apexdecor.com',
        phone: '+1 (312) 555-2020',
        company: 'Urban Living Furniture',
        tags: ['Retail', 'High Value'],
        status: 'ACTIVE',
        assignedEmployee: chloeId,
        notesSummary: 'Custom mahogany coffee table line.',
      },
      {
        firstName: 'Fiona',
        lastName: 'Gallagher',
        email: 'fiona@windycitymarket.com',
        phone: '+1 (312) 555-3030',
        company: 'Windy City Organic Market',
        tags: ['Wholesale', 'Local'],
        status: 'ACTIVE',
        assignedEmployee: jordanId,
        notesSummary: 'Fresh produce packaging supply contract.',
      },
      {
        firstName: 'Oliver',
        lastName: 'Queen',
        email: 'oliver@starlingapparel.com',
        phone: '+1 (312) 555-4040',
        company: 'Starling Sportswear',
        tags: ['VIP', 'Athletic'],
        status: 'ACTIVE',
        assignedEmployee: liamId,
        notesSummary: 'Athletic wear distributor expanding to Midwest stores.',
      },
      {
        firstName: 'Diana',
        lastName: 'Prince',
        email: 'diana@themysciradesigns.com',
        phone: '+1 (312) 555-5050',
        company: 'Themyscira Artisans',
        tags: ['Luxury', 'Returning'],
        status: 'ACTIVE',
        assignedEmployee: chloeId,
        notesSummary: 'Handcrafted leather goods and accessories.',
      },
      {
        firstName: 'Barry',
        lastName: 'Allen',
        email: 'barry@centralfleet.com',
        phone: '+1 (312) 555-6060',
        company: 'Central City Logistics Express',
        tags: ['Logistics'],
        status: 'ACTIVE',
        assignedEmployee: jordanId,
        notesSummary: 'Same-day courier partner for downtown deliveries.',
      },
      {
        firstName: 'Hal',
        lastName: 'Jordan',
        email: 'hal@ferrisair.com',
        phone: '+1 (312) 555-7070',
        company: 'Ferris Aerospace Accessories',
        tags: ['Lead'],
        status: 'INACTIVE',
        assignedEmployee: liamId,
        notesSummary: 'Contract under legal review.',
      },
      {
        firstName: 'Arthur',
        lastName: 'Curry',
        email: 'arthur@atlantisgoods.com',
        phone: '+1 (312) 555-8080',
        company: 'Oceanic Seafood Wholesalers',
        tags: ['Wholesale', 'Perishable'],
        status: 'ACTIVE',
        assignedEmployee: chloeId,
        notesSummary: 'Cold-chain shipping containers verification.',
      },
      {
        firstName: 'Iris',
        lastName: 'West',
        email: 'iris@centralherald.com',
        phone: '+1 (312) 555-9090',
        company: 'Central Herald News Agency',
        tags: ['Local'],
        status: 'ACTIVE',
        assignedEmployee: jordanId,
        notesSummary: 'Paper & print stock supplier.',
      },
      {
        firstName: 'Bruce',
        lastName: 'Wayne',
        email: 'bruce@wayneenterprises.com',
        phone: '+1 (312) 555-0001',
        company: 'Wayne Technologies Group',
        tags: ['VIP', 'Enterprise', 'High Value'],
        status: 'ACTIVE',
        assignedEmployee: nexusOwnerId,
        notesSummary: 'Exclusive distribution rights for proprietary packaging polymers.',
      },
      {
        firstName: 'Selina',
        lastName: 'Kyle',
        email: 'selina@vintagejewels.com',
        phone: '+1 (312) 555-0002',
        company: 'Gotham Vintage Gems',
        tags: ['Archived'],
        status: 'ARCHIVED',
        assignedEmployee: chloeId,
        notesSummary: 'Account closed.',
      },
    ];

    const nexusCustomers = nexusCustomersRaw.map((c, idx) => ({
      _id: `cust_nex_${200 + idx}`,
      id: `cust_nex_${200 + idx}`,
      businessId: nexusBizId,
      ...c,
      createdBy: nexusOwnerId,
      jobTitle: 'Procurement Specialist',
      source: 'REFERRAL',
      address: {
        street: `${500 + idx * 10} Michigan Avenue`,
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        postalCode: '60611',
      },
      createdAt: new Date(Date.now() - (idx + 1) * 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000),
    }));

    this.customers.push(...nexusCustomers);

    // ─── Customer Notes ──────────────────────────────────
    const targetCust = this.customers[0]; // Jonathan Sterling
    this.customerNotes = [
      {
        _id: 'note_1',
        id: 'note_1',
        businessId: apexBizId,
        customerId: targetCust._id,
        authorId: ownerId,
        content: 'Met with Jonathan and his VP of Comms in Manhattan. They want to start the campaign by Q3.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'note_2',
        id: 'note_2',
        businessId: apexBizId,
        customerId: targetCust._id,
        authorId: managerId,
        content: 'Sent draft scope of work with milestone estimates. Waiting for legal approval.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    // ─── Customer Activities ─────────────────────────────
    this.customerActivities = [
      {
        _id: 'act_1',
        id: 'act_1',
        businessId: apexBizId,
        customerId: targetCust._id,
        userId: ownerId,
        type: 'CREATED',
        metadata: { name: 'Jonathan Sterling', company: 'Sterling Global Media' },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'act_2',
        id: 'act_2',
        businessId: apexBizId,
        customerId: targetCust._id,
        userId: ownerId,
        type: 'ASSIGNED',
        metadata: { assignedToName: 'Sarah Chen' },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'act_3',
        id: 'act_3',
        businessId: apexBizId,
        customerId: targetCust._id,
        userId: managerId,
        type: 'NOTE_ADDED',
        metadata: { notePreview: 'Sent draft scope of work with milestone estimates.' },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    // Load Phase 4 & Final Milestones Mock Data
    const finalData = getFinalSeedData(this.users, this.businesses, this.customers);
    this.users.push(...finalData.extraUsers);
    this.memberships.push(...finalData.extraMemberships);
    this.services = finalData.services;
    this.projects = finalData.projects;
    this.tasks = finalData.tasks;
    this.invoices = finalData.invoices;
    this.payments = finalData.payments;
    this.expenses = finalData.expenses;
    this.suppliers = finalData.suppliers;
    this.inventoryItems = finalData.inventoryItems;
    this.inventoryTransactions = finalData.inventoryTransactions;
    this.notifications = finalData.notifications;
    this.files = finalData.files;
    this.auditLogs = finalData.auditLogs;
    this.plans = finalData.plans;
    this.subscriptions = finalData.subscriptions;

    this.initialized = true;
    console.log('[DevMockDb] Full SaaS initialized with Projects, Tasks, Services, Invoices, Payments, Expenses, Inventory, Notifications, Files, AuditLogs & Subscriptions.');
  }

  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find((u) => String(u._id) === String(id) || String(u.id) === String(id));
  }

  findBusinessById(id) {
    return this.businesses.find((b) => String(b._id) === String(id) || String(b.id) === String(id));
  }

  findMembershipsByUser(userId) {
    return this.memberships.filter((m) => String(m.userId) === String(userId));
  }

  findMembershipsByBusiness(businessId) {
    return this.memberships.filter((m) => String(m.businessId) === String(businessId));
  }

  findCustomersByBusiness(businessId) {
    return this.customers.filter((c) => String(c.businessId) === String(businessId));
  }

  findCustomerById(id, businessId) {
    return this.customers.find(
      (c) =>
        (String(c._id) === String(id) || String(c.id) === String(id)) &&
        String(c.businessId) === String(businessId)
    );
  }

  findNotesByCustomer(customerId, businessId) {
    return this.customerNotes.filter(
      (n) =>
        String(n.customerId) === String(customerId) &&
        String(n.businessId) === String(businessId)
    );
  }

  findActivitiesByCustomer(customerId, businessId) {
    return this.customerActivities.filter(
      (a) =>
        String(a.customerId) === String(customerId) &&
        String(a.businessId) === String(businessId)
    );
  }

  findEmployeesByBusiness(businessId) {
    return this.employeeProfiles.filter((e) => String(e.businessId) === String(businessId));
  }

  findInvitationsByBusiness(businessId) {
    return this.invitations.filter((i) => String(i.businessId) === String(businessId));
  }

  findServicesByBusiness(businessId) {
    return this.services.filter((s) => String(s.businessId) === String(businessId));
  }

  findServiceById(id, businessId) {
    return this.services.find(
      (s) =>
        (String(s._id) === String(id) || String(s.id) === String(id)) &&
        String(s.businessId) === String(businessId)
    );
  }

  findProjectsByBusiness(businessId) {
    return this.projects.filter((p) => String(p.businessId) === String(businessId));
  }

  findProjectById(id, businessId) {
    return this.projects.find(
      (p) =>
        (String(p._id) === String(id) || String(p.id) === String(id)) &&
        String(p.businessId) === String(businessId)
    );
  }

  findTasksByBusiness(businessId) {
    return this.tasks.filter((t) => String(t.businessId) === String(businessId));
  }

  findTasksByProject(projectId, businessId) {
    return this.tasks.filter(
      (t) =>
        String(t.projectId) === String(projectId) &&
        String(t.businessId) === String(businessId)
    );
  }

  findTaskById(id, businessId) {
    return this.tasks.find(
      (t) =>
        (String(t._id) === String(id) || String(t.id) === String(id)) &&
        String(t.businessId) === String(businessId)
    );
  }

  findInvoicesByBusiness(businessId) {
    return this.invoices.filter((i) => String(i.businessId) === String(businessId));
  }

  findInvoiceById(id, businessId) {
    return this.invoices.find(
      (i) =>
        (String(i._id) === String(id) || String(i.id) === String(id)) &&
        String(i.businessId) === String(businessId)
    );
  }

  findPaymentsByBusiness(businessId) {
    return this.payments.filter((p) => String(p.businessId) === String(businessId));
  }

  findExpensesByBusiness(businessId) {
    return this.expenses.filter((e) => String(e.businessId) === String(businessId));
  }

  findExpenseById(id, businessId) {
    return this.expenses.find(
      (e) =>
        (String(e._id) === String(id) || String(e.id) === String(id)) &&
        String(e.businessId) === String(businessId)
    );
  }

  findSuppliersByBusiness(businessId) {
    return this.suppliers.filter((s) => String(s.businessId) === String(businessId));
  }

  findInventoryItemsByBusiness(businessId) {
    return this.inventoryItems.filter((i) => String(i.businessId) === String(businessId));
  }

  findInventoryItemById(id, businessId) {
    return this.inventoryItems.find(
      (i) =>
        (String(i._id) === String(id) || String(i.id) === String(id)) &&
        String(i.businessId) === String(businessId)
    );
  }

  findTransactionsByItem(itemId, businessId) {
    return this.inventoryTransactions.filter(
      (t) =>
        String(t.itemId) === String(itemId) &&
        String(t.businessId) === String(businessId)
    );
  }

  findNotificationsByUser(userId, businessId) {
    return this.notifications.filter(
      (n) =>
        String(n.userId) === String(userId) &&
        String(n.businessId) === String(businessId)
    );
  }

  findFilesByBusiness(businessId) {
    return this.files.filter((f) => String(f.businessId) === String(businessId));
  }

  findAuditLogsByBusiness(businessId) {
    return this.auditLogs.filter((a) => String(a.businessId) === String(businessId));
  }

  findSubscriptionByBusiness(businessId) {
    return this.subscriptions.find((s) => String(s.businessId) === String(businessId));
  }
}

export const devMockDb = new DevMockDb();
export default devMockDb;
