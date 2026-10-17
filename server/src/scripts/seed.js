import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Membership from '../models/Membership.js';
import Customer from '../models/Customer.js';
import CustomerNote from '../models/CustomerNote.js';
import CustomerActivity from '../models/CustomerActivity.js';
import EmployeeProfile from '../models/EmployeeProfile.js';
import Invitation from '../models/Invitation.js';
import { USER_ROLES, MEMBERSHIP_STATUS } from '../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizora';

async function seed() {
  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Business.deleteMany({});
    await Membership.deleteMany({});
    await Customer.deleteMany({});
    await CustomerNote.deleteMany({});
    await CustomerActivity.deleteMany({});
    await EmployeeProfile.deleteMany({});
    await Invitation.deleteMany({});

    console.log('Creating demo users...');
    // Demo Owner
    const owner = await User.create({
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'owner@bizora.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 234-5678',
      status: 'active',
      preferences: { theme: 'dark', notifications: { email: true, inApp: true } },
    });

    // Primary Developer / Owner
    const sheshank = await User.create({
      firstName: 'Sheshank',
      lastName: 'Gahlawat',
      email: 'sheshankgahlawat2428@gmail.com',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 000-1122',
      status: 'active',
      preferences: { theme: 'dark', notifications: { email: true, inApp: true } },
    });

    // Demo Manager
    const manager = await User.create({
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'manager@bizora.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 876-5432',
      status: 'active',
      preferences: { theme: 'system', notifications: { email: true, inApp: true } },
    });

    // Demo Employee
    const employee = await User.create({
      firstName: 'David',
      lastName: 'Kim',
      email: 'employee@bizora.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 345-6789',
      status: 'active',
      preferences: { theme: 'light', notifications: { email: false, inApp: true } },
    });

    // Second Business Owner (for Tenant Isolation testing)
    const nexusOwner = await User.create({
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'nexus@bizora.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 999-0000',
      status: 'active',
      preferences: { theme: 'dark', notifications: { email: true, inApp: true } },
    });

    console.log('Creating demo businesses...');
    const apexBusiness = await Business.create({
      name: 'Apex Digital Solutions',
      slug: 'apex-digital-solutions',
      ownerId: owner._id,
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
    });

    const nexusBusiness = await Business.create({
      name: 'Nexus Retail Labs',
      slug: 'nexus-retail-labs',
      ownerId: nexusOwner._id,
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
    });

    // Apex Extra Members
    const apexEmp2 = await User.create({
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'marcus.vance@bizora.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 432-1098',
      status: 'active',
    });

    const apexEmp3 = await User.create({
      firstName: 'Chloe',
      lastName: 'Bennett',
      email: 'chloe.b@bizora.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 321-6549',
      status: 'active',
    });

    // Nexus Extra Members
    const nexusEmp1 = await User.create({
      firstName: 'Julian',
      lastName: 'Haze',
      email: 'julian@nexusretail.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 667-8899',
      status: 'active',
    });

    const nexusEmp2 = await User.create({
      firstName: 'Aaliyah',
      lastName: 'Patel',
      email: 'aaliyah@nexusretail.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 443-2211',
      status: 'active',
    });

    const nexusEmp3 = await User.create({
      firstName: 'Liam',
      lastName: 'O\'Connor',
      email: 'liam@nexusretail.demo',
      password: 'Password123!',
      isEmailVerified: true,
      phone: '+1 (555) 998-1122',
      status: 'active',
    });

    console.log('Creating workspace memberships & RBAC roles...');
    // Apex Memberships (5 Members)
    const mOwner = await Membership.create({
      userId: owner._id,
      businessId: apexBusiness._id,
      role: USER_ROLES.OWNER,
      title: 'Founder & CEO',
      department: 'Executive',
      status: MEMBERSHIP_STATUS.ACTIVE,
    });

    await Membership.create({
      userId: sheshank._id,
      businessId: apexBusiness._id,
      role: USER_ROLES.OWNER,
      title: 'Founder & CEO',
      department: 'Executive',
      status: MEMBERSHIP_STATUS.ACTIVE,
    });

    const mManager = await Membership.create({
      userId: manager._id,
      businessId: apexBusiness._id,
      role: USER_ROLES.MANAGER,
      title: 'Head of Product & Delivery',
      department: 'Management',
      status: MEMBERSHIP_STATUS.ACTIVE,
      invitedBy: owner._id,
    });

    const mEmp1 = await Membership.create({
      userId: employee._id,
      businessId: apexBusiness._id,
      role: USER_ROLES.EMPLOYEE,
      title: 'Senior Solutions Architect',
      department: 'Engineering',
      status: MEMBERSHIP_STATUS.ACTIVE,
      invitedBy: manager._id,
    });

    const mEmp2 = await Membership.create({
      userId: apexEmp2._id,
      businessId: apexBusiness._id,
      role: USER_ROLES.EMPLOYEE,
      title: 'Lead UI/UX Designer',
      department: 'Design',
      status: MEMBERSHIP_STATUS.ACTIVE,
      invitedBy: owner._id,
    });

    const mEmp3 = await Membership.create({
      userId: apexEmp3._id,
      businessId: apexBusiness._id,
      role: USER_ROLES.EMPLOYEE,
      title: 'Client Success Manager',
      department: 'Client Services',
      status: MEMBERSHIP_STATUS.ACTIVE,
      invitedBy: manager._id,
    });

    // Nexus Memberships (4 Members)
    const mNexusOwner = await Membership.create({
      userId: nexusOwner._id,
      businessId: nexusBusiness._id,
      role: USER_ROLES.OWNER,
      title: 'Managing Director & Founder',
      department: 'Executive',
      status: MEMBERSHIP_STATUS.ACTIVE,
    });

    const mNexus1 = await Membership.create({
      userId: nexusEmp1._id,
      businessId: nexusBusiness._id,
      role: USER_ROLES.MANAGER,
      title: 'Store Operations Director',
      department: 'Operations',
      status: MEMBERSHIP_STATUS.ACTIVE,
      invitedBy: nexusOwner._id,
    });

    const mNexus2 = await Membership.create({
      userId: nexusEmp2._id,
      businessId: nexusBusiness._id,
      role: USER_ROLES.EMPLOYEE,
      title: 'Inventory & Merchandising Specialist',
      department: 'Logistics',
      status: MEMBERSHIP_STATUS.ACTIVE,
      invitedBy: nexusEmp1._id,
    });

    const mNexus3 = await Membership.create({
      userId: nexusEmp3._id,
      businessId: nexusBusiness._id,
      role: USER_ROLES.EMPLOYEE,
      title: 'Customer Experience Lead',
      department: 'Customer Support',
      status: MEMBERSHIP_STATUS.ACTIVE,
      invitedBy: nexusEmp1._id,
    });

    console.log('Creating Employee Profiles...');
    await EmployeeProfile.create([
      { userId: owner._id, businessId: apexBusiness._id, jobTitle: 'Founder & CEO', department: 'Executive', employeeCode: 'APX-001', joiningDate: new Date('2023-01-15'), bio: 'Founder of Apex Digital Solutions with 15+ years in cloud consulting.' },
      { userId: manager._id, businessId: apexBusiness._id, jobTitle: 'Head of Product & Delivery', department: 'Management', employeeCode: 'APX-002', joiningDate: new Date('2023-03-01'), bio: 'Agile strategist overseeing client project lifecycle.' },
      { userId: employee._id, businessId: apexBusiness._id, jobTitle: 'Senior Solutions Architect', department: 'Engineering', employeeCode: 'APX-003', joiningDate: new Date('2023-06-15'), bio: 'Specialist in full-stack architecture, microservices, and databases.' },
      { userId: apexEmp2._id, businessId: apexBusiness._id, jobTitle: 'Lead UI/UX Designer', department: 'Design', employeeCode: 'APX-004', joiningDate: new Date('2023-08-10'), bio: 'Crafting premium glassmorphism interfaces and design systems.' },
      { userId: apexEmp3._id, businessId: apexBusiness._id, jobTitle: 'Client Success Manager', department: 'Client Services', employeeCode: 'APX-005', joiningDate: new Date('2024-01-08'), bio: 'Dedicated partner for enterprise account onboarding and expansion.' },
      { userId: nexusOwner._id, businessId: nexusBusiness._id, jobTitle: 'Managing Director & Founder', department: 'Executive', employeeCode: 'NEX-001', joiningDate: new Date('2023-02-01'), bio: 'Pioneering boutique retail experience and pop-up store rollouts.' },
      { userId: nexusEmp1._id, businessId: nexusBusiness._id, jobTitle: 'Store Operations Director', department: 'Operations', employeeCode: 'NEX-002', joiningDate: new Date('2023-04-12'), bio: 'Managing physical and e-commerce multichannel retail operations.' },
      { userId: nexusEmp2._id, businessId: nexusBusiness._id, jobTitle: 'Inventory Specialist', department: 'Logistics', employeeCode: 'NEX-003', joiningDate: new Date('2023-07-20'), bio: 'Overseeing omni-channel stock levels and warehouse fulfillment.' },
      { userId: nexusEmp3._id, businessId: nexusBusiness._id, jobTitle: 'Customer Experience Lead', department: 'Customer Support', employeeCode: 'NEX-004', joiningDate: new Date('2024-02-15'), bio: 'Leading VIP client concierge and customer inquiries.' },
    ]);

    console.log('Creating realistic Customers for Apex Digital Solutions (16 customers)...');
    const apexCustomers = await Customer.create([
      { firstName: 'Sophia', lastName: 'Reynolds', email: 'sophia@acmeventures.com', phone: '+1 (555) 234-8890', company: 'Acme Ventures', jobTitle: 'Chief Innovation Officer', city: 'San Francisco', state: 'CA', country: 'United States', postalCode: '94107', tags: ['VIP', 'High Value', 'Enterprise'], status: 'ACTIVE', source: 'REFERRAL', assignedEmployee: employee._id, createdBy: owner._id, businessId: apexBusiness._id },
      { firstName: 'Marcus', lastName: 'Sterling', email: 'm.sterling@bluehorizon.io', phone: '+1 (555) 345-9981', company: 'Blue Horizon Tech', jobTitle: 'VP of Engineering', city: 'Austin', state: 'TX', country: 'United States', postalCode: '78701', tags: ['Lead', 'Returning'], status: 'ACTIVE', source: 'WEBSITE', assignedEmployee: employee._id, createdBy: manager._id, businessId: apexBusiness._id },
      { firstName: 'Isabella', lastName: 'Santos', email: 'isabella@luminahealth.org', phone: '+1 (555) 456-1122', company: 'Lumina Health Systems', jobTitle: 'Director of Digital Products', city: 'Boston', state: 'MA', country: 'United States', postalCode: '02110', tags: ['VIP', 'Enterprise'], status: 'ACTIVE', source: 'ADVERTISEMENT', assignedEmployee: manager._id, createdBy: owner._id, businessId: apexBusiness._id },
      { firstName: 'Nathaniel', lastName: 'Drake', email: 'nathan@vanguardfintech.com', phone: '+1 (555) 567-2233', company: 'Vanguard FinTech', jobTitle: 'Head of Compliance & Tech', city: 'New York', state: 'NY', country: 'United States', postalCode: '10005', tags: ['High Value'], status: 'ACTIVE', source: 'REFERRAL', assignedEmployee: employee._id, createdBy: manager._id, businessId: apexBusiness._id },
      { firstName: 'Clara', lastName: 'Oswald', email: 'clara@tardisdesign.co', phone: '+1 (555) 678-3344', company: 'Tardis Creative Media', jobTitle: 'Principal Creative Director', city: 'London', state: 'England', country: 'United Kingdom', postalCode: 'EC1A 1BB', tags: ['Local', 'Returning'], status: 'ACTIVE', source: 'SOCIAL_MEDIA', assignedEmployee: apexEmp2._id, createdBy: owner._id, businessId: apexBusiness._id },
      { firstName: 'Liam', lastName: 'Hemsworth', email: 'liam@airstreamventures.com', phone: '+1 (555) 789-4455', company: 'Airstream Global', jobTitle: 'Managing Partner', city: 'Seattle', state: 'WA', country: 'United States', postalCode: '98101', tags: ['Enterprise', 'Lead'], status: 'ACTIVE', source: 'WEBSITE', assignedEmployee: apexEmp3._id, createdBy: manager._id, businessId: apexBusiness._id },
      { firstName: 'Zoe', lastName: 'Kravitz', email: 'zoe@hyperionrobotics.com', phone: '+1 (555) 890-5566', company: 'Hyperion Robotics', jobTitle: 'COO', city: 'Denver', state: 'CO', country: 'United States', postalCode: '80202', tags: ['High Value', 'VIP'], status: 'ACTIVE', source: 'REFERRAL', assignedEmployee: employee._id, createdBy: owner._id, businessId: apexBusiness._id },
      { firstName: 'Ethan', lastName: 'Hunt', email: 'ethan@syndicateintel.com', phone: '+1 (555) 901-6677', company: 'Syndicate Cyber Intelligence', jobTitle: 'Chief Security Officer', city: 'Washington', state: 'DC', country: 'United States', postalCode: '20006', tags: ['Enterprise'], status: 'ACTIVE', source: 'PHONE', assignedEmployee: manager._id, createdBy: manager._id, businessId: apexBusiness._id },
      { firstName: 'Maya', lastName: 'Lin', email: 'maya@zenithenergy.com', phone: '+1 (555) 012-7788', company: 'Zenith Renewable Energy', jobTitle: 'VP Sustainability', city: 'Portland', state: 'OR', country: 'United States', postalCode: '97201', tags: ['Returning'], status: 'ACTIVE', source: 'WEBSITE', assignedEmployee: apexEmp3._id, createdBy: owner._id, businessId: apexBusiness._id },
      { firstName: 'Julian', lastName: 'Bashir', email: 'julian@deepspacebio.org', phone: '+1 (555) 123-8899', company: 'DeepSpace BioTech', jobTitle: 'Chief Medical Officer', city: 'San Diego', state: 'CA', country: 'United States', postalCode: '92101', tags: ['VIP'], status: 'ACTIVE', source: 'EMAIL', assignedEmployee: employee._id, createdBy: manager._id, businessId: apexBusiness._id },
      { firstName: 'Gemma', lastName: 'Chan', email: 'gemma@silkroadlogistics.com', phone: '+1 (555) 234-9900', company: 'Silk Road Logistics', jobTitle: 'Operations Director', city: 'Atlanta', state: 'GA', country: 'United States', postalCode: '30303', tags: ['Wholesale'], status: 'ACTIVE', source: 'REFERRAL', assignedEmployee: apexEmp3._id, createdBy: owner._id, businessId: apexBusiness._id },
      { firstName: 'Arthur', lastName: 'Dent', email: 'arthur@galaxyguides.co.uk', phone: '+1 (555) 345-0011', company: 'Galaxy Guides', jobTitle: 'Senior Editor', city: 'London', state: 'England', country: 'United Kingdom', postalCode: 'SW1A 1AA', tags: ['Lead'], status: 'INACTIVE', source: 'WEBSITE', assignedEmployee: apexEmp2._id, createdBy: manager._id, businessId: apexBusiness._id },
      { firstName: 'Penelope', lastName: 'Featherington', email: 'penelope@whistledownpress.com', phone: '+1 (555) 456-1123', company: 'Whistledown Publications', jobTitle: 'Editor-in-Chief', city: 'Bath', state: 'Somerset', country: 'United Kingdom', postalCode: 'BA1 1EE', tags: ['Returning', 'High Value'], status: 'ACTIVE', source: 'SOCIAL_MEDIA', assignedEmployee: apexEmp2._id, createdBy: owner._id, businessId: apexBusiness._id },
      { firstName: 'Lucas', lastName: 'Scott', email: 'lucas@treehillmedia.com', phone: '+1 (555) 567-2234', company: 'Tree Hill Sports Media', jobTitle: 'Founder', city: 'Wilmington', state: 'NC', country: 'United States', postalCode: '28401', tags: ['Local'], status: 'ACTIVE', source: 'WALK_IN', assignedEmployee: apexEmp3._id, createdBy: owner._id, businessId: apexBusiness._id },
      { firstName: 'Vivian', lastName: 'Ward', email: 'vivian@rodeoenterprise.com', phone: '+1 (555) 678-3345', company: 'Rodeo Retail Group', jobTitle: 'Fashion Director', city: 'Beverly Hills', state: 'CA', country: 'United States', postalCode: '90210', tags: ['VIP', 'Wholesale'], status: 'ACTIVE', source: 'REFERRAL', assignedEmployee: manager._id, createdBy: manager._id, businessId: apexBusiness._id },
      { firstName: 'Garrick', lastName: 'Ollivander', email: 'garrick@diagoncrafts.com', phone: '+1 (555) 789-4456', company: 'Diagon Artisan Crafts', jobTitle: 'Master Craftsman', city: 'Edinburgh', state: 'Scotland', country: 'United Kingdom', postalCode: 'EH1 1YZ', tags: ['Archived Customer'], status: 'ARCHIVED', source: 'WALK_IN', assignedEmployee: employee._id, createdBy: owner._id, businessId: apexBusiness._id },
    ]);

    console.log('Creating realistic Customers for Nexus Retail Labs (11 customers)...');
    await Customer.create([
      { firstName: 'Amara', lastName: 'Kalu', email: 'amara@velvetbrands.com', phone: '+1 (555) 888-1010', company: 'Velvet Brands Africa', jobTitle: 'Creative Director', city: 'Chicago', state: 'IL', country: 'United States', postalCode: '60614', tags: ['VIP', 'Wholesale'], status: 'ACTIVE', source: 'REFERRAL', assignedEmployee: nexusEmp1._id, createdBy: nexusOwner._id, businessId: nexusBusiness._id },
      { firstName: 'Dante', lastName: 'Alighieri', email: 'dante@firenzeleather.it', phone: '+1 (555) 888-2020', company: 'Firenze Leatherworks', jobTitle: 'Owner', city: 'Florence', state: 'Tuscany', country: 'Italy', postalCode: '50122', tags: ['High Value'], status: 'ACTIVE', source: 'WEBSITE', assignedEmployee: nexusEmp2._id, createdBy: nexusOwner._id, businessId: nexusBusiness._id },
      { firstName: 'Beatrice', lastName: 'Portinari', email: 'beatrice@museboutique.it', phone: '+1 (555) 888-3030', company: 'Muse Fashion Boutique', jobTitle: 'Boutique Buyer', city: 'Milan', state: 'Lombardy', country: 'Italy', postalCode: '20121', tags: ['VIP', 'Returning'], status: 'ACTIVE', source: 'REFERRAL', assignedEmployee: nexusEmp3._id, createdBy: nexusEmp1._id, businessId: nexusBusiness._id },
      { firstName: 'Gabriel', lastName: 'Mercer', email: 'gabriel@urbanroast.co', phone: '+1 (555) 888-4040', company: 'Urban Roast Coffeehouse', jobTitle: 'Managing Partner', city: 'Chicago', state: 'IL', country: 'United States', postalCode: '60601', tags: ['Local', 'Wholesale'], status: 'ACTIVE', source: 'WALK_IN', assignedEmployee: nexusEmp2._id, createdBy: nexusOwner._id, businessId: nexusBusiness._id },
      { firstName: 'Serena', lastName: 'Van Der Woodsen', email: 'serena@uppereastluxury.com', phone: '+1 (555) 888-5050', company: 'Upper East Luxury Curators', jobTitle: 'Event Coordinator', city: 'New York', state: 'NY', country: 'United States', postalCode: '10021', tags: ['VIP', 'High Value'], status: 'ACTIVE', source: 'SOCIAL_MEDIA', assignedEmployee: nexusEmp3._id, createdBy: nexusEmp1._id, businessId: nexusBusiness._id },
      { firstName: 'Blair', lastName: 'Waldorf', email: 'blair@waldorfdesigns.com', phone: '+1 (555) 888-6060', company: 'Waldorf Designs Inc', jobTitle: 'President', city: 'New York', state: 'NY', country: 'United States', postalCode: '10028', tags: ['Enterprise', 'VIP'], status: 'ACTIVE', source: 'REFERRAL', assignedEmployee: nexusEmp1._id, createdBy: nexusOwner._id, businessId: nexusBusiness._id },
      { firstName: 'Chuck', lastName: 'Bass', email: 'chuck@empirehotelgroup.com', phone: '+1 (555) 888-7070', company: 'Empire Hospitality Group', jobTitle: 'Chief Executive Officer', city: 'New York', state: 'NY', country: 'United States', postalCode: '10023', tags: ['Enterprise', 'High Value'], status: 'ACTIVE', source: 'EMAIL', assignedEmployee: nexusOwner._id, createdBy: nexusOwner._id, businessId: nexusBusiness._id },
      { firstName: 'Dan', lastName: 'Humphrey', email: 'dan@brooklynliterary.org', phone: '+1 (555) 888-8080', company: 'Brooklyn Literary Review', jobTitle: 'Managing Editor', city: 'Brooklyn', state: 'NY', country: 'United States', postalCode: '11201', tags: ['Lead'], status: 'ACTIVE', source: 'WEBSITE', assignedEmployee: nexusEmp3._id, createdBy: nexusEmp1._id, businessId: nexusBusiness._id },
      { firstName: 'Nate', lastName: 'Archibald', email: 'nate@spectatorpress.com', phone: '+1 (555) 888-9090', company: 'The Spectator Press', jobTitle: 'Publisher', city: 'New York', state: 'NY', country: 'United States', postalCode: '10019', tags: ['Returning'], status: 'ACTIVE', source: 'ADVERTISEMENT', assignedEmployee: nexusEmp2._id, createdBy: nexusOwner._id, businessId: nexusBusiness._id },
      { firstName: 'Jenny', lastName: 'Humphrey', email: 'jenny@jforjclothing.com', phone: '+1 (555) 888-0101', company: 'J For J Apparel', jobTitle: 'Creative Director', city: 'London', state: 'England', country: 'United Kingdom', postalCode: 'E1 6AN', tags: ['Wholesale'], status: 'INACTIVE', source: 'SOCIAL_MEDIA', assignedEmployee: nexusEmp2._id, createdBy: nexusEmp1._id, businessId: nexusBusiness._id },
      { firstName: 'Lily', lastName: 'van der Woodsen', email: 'lily@bassvanfoundation.org', phone: '+1 (555) 888-0202', company: 'Bass Van der Woodsen Philanthropy', jobTitle: 'Trustee', city: 'New York', state: 'NY', country: 'United States', postalCode: '10022', tags: ['VIP', 'Archived'], status: 'ARCHIVED', source: 'REFERRAL', assignedEmployee: nexusOwner._id, createdBy: nexusOwner._id, businessId: nexusBusiness._id },
    ]);

    console.log('Attaching Notes and Activity for Apex customer Sophia Reynolds...');
    const sophia = apexCustomers[0];
    await CustomerNote.create([
      { customerId: sophia._id, businessId: apexBusiness._id, authorId: owner._id, content: 'Initial discovery call went exceptionally well. Looking to revamp their enterprise customer portal by Q3.' },
      { customerId: sophia._id, businessId: apexBusiness._id, authorId: employee._id, content: 'Reviewed technical requirements and architecture specifications. Proposed glassmorphism UI/UX kit.' },
    ]);

    await CustomerActivity.create([
      { businessId: apexBusiness._id, customerId: sophia._id, userId: owner._id, type: 'CREATED', metadata: { name: 'Sophia Reynolds', company: 'Acme Ventures' } },
      { businessId: apexBusiness._id, customerId: sophia._id, userId: owner._id, type: 'ASSIGNED', metadata: { assignedToName: 'David Kim' } },
      { businessId: apexBusiness._id, customerId: sophia._id, userId: owner._id, type: 'NOTE_ADDED', metadata: { preview: 'Initial discovery call went exceptionally well...' } },
      { businessId: apexBusiness._id, customerId: sophia._id, userId: employee._id, type: 'NOTE_ADDED', metadata: { preview: 'Reviewed technical requirements and architecture specifications...' } },
    ]);

    console.log('Creating pending Invitations...');
    await Invitation.create([
      { businessId: apexBusiness._id, email: 'newhire.qa@bizora.demo', role: USER_ROLES.EMPLOYEE, invitedBy: owner._id, token: 'demo-token-apex-qa-12345', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'PENDING' },
      { businessId: nexusBusiness._id, email: 'futuremanager@nexusretail.demo', role: USER_ROLES.MANAGER, invitedBy: nexusOwner._id, token: 'demo-token-nexus-mgr-67890', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'PENDING' },
    ]);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY');
    console.log('======================================================');
    console.log('Demo Accounts Created (Password for all: Password123!):');
    console.log('1. Owner:    owner@bizora.demo    -> Apex Digital Solutions (Owner, 5 team members, 16 customers)');
    console.log('2. Manager:  manager@bizora.demo  -> Apex Digital Solutions (Manager)');
    console.log('3. Employee: employee@bizora.demo -> Apex Digital Solutions (Employee)');
    console.log('4. Isolated: nexus@bizora.demo    -> Nexus Retail Labs (Owner, 4 team members, 11 customers)');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed script error:', error);
    process.exit(1);
  }
}

seed();
