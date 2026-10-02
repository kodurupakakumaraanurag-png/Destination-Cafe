import { PrismaClient, Priority, LeadStatus, ProjectAllocationStatus, UserRole, TaskStatus, OpportunityStage, ActivityType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data before seeding to ensure idempotent state
  await prisma.activity.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.leadScore.deleteMany({});
  await prisma.importError.deleteMany({});
  await prisma.importBatch.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // 1. Seed Roles
  const roles = [
    { name: UserRole.ADMIN, description: "Full system administration, settings, and user management" },
    { name: UserRole.MANAGER, description: "Team management, operational pipeline oversight, and audit logs" },
    { name: UserRole.SALES, description: "Lead tracking, pipeline opportunity management, and tasks" },
    { name: UserRole.ANALYST, description: "Data analytics, lead scoring management, and CSV ingestion" },
    { name: UserRole.VIEWER, description: "Read-only access to leads and analytics" },
  ];

  for (const roleData of roles) {
    await prisma.role.create({ data: roleData });
  }

  // 2. Seed Demo Users for Development
  const demoUsersData = [
    { name: "Demo Admin", email: "admin@destinationcafe.com", role: UserRole.ADMIN },
    { name: "Demo Manager", email: "manager@destinationcafe.com", role: UserRole.MANAGER },
    { name: "Demo Sales", email: "sales@destinationcafe.com", role: UserRole.SALES },
    { name: "Demo Analyst", email: "analyst@destinationcafe.com", role: UserRole.ANALYST },
    { name: "Demo Viewer", email: "viewer@destinationcafe.com", role: UserRole.VIEWER },
  ];

  const createdUsers: Record<string, string> = {};

  for (const u of demoUsersData) {
    const roleRecord = await prisma.role.findUnique({ where: { name: u.role } });
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        userRole: u.role,
        roleId: roleRecord?.id,
      },
    });
    createdUsers[u.role] = user.id;
  }

  const adminUserId = createdUsers[UserRole.ADMIN];
  const salesUserId = createdUsers[UserRole.SALES];
  const managerUserId = createdUsers[UserRole.MANAGER];

  // 3. Seed Exact Destination Cafe Lead Record
  const destinationCafeLead = await prisma.lead.create({
    data: {
      company: "Destination Cafe",
      domain: "Restaurant",
      location: "Cybercity Marina Skies, Green Hills Rd, opp. to IDL Lake Road, Cybercity, Kukatpally, Hyderabad, Telangana 500018, India",
      website: "No verified dedicated official website found",
      contactPerson: null,
      designation: null,
      phone: null,
      email: null,
      businessUnderstanding: "Destination Cafe is an active enterprise in the Restaurant sector requiring modernized full-stack web solutions.",
      possibleProblem: "Legacy workflow, manual processes, or lack of automated CRM pipeline.",
      requirement: "Custom enterprise web application and management system.",
      opportunity: "High leverage live industry project for portfolio demonstration.",
      priority: Priority.MEDIUM,
      status: LeadStatus.NEW,
      nextAction: "Contact management for website/CRM proposal",
      dateAdded: new Date("2026-09-21"),
      source: "Google Sheet Import",
      contactMethod: "LinkedIn / Email",
      digitalPresenceScore: 0,
      hiringActivityScore: 0,
      techStackFitScore: 0,
      fundingRevenueScore: 0,
      projectUrgencyScore: 0,
      budgetClarityScore: 0,
      recordedLeadScore: 18,
      calculatedLeadScore: 0, // Discrepancy: recorded 18, calculated 0
      projectAllocationStatus: ProjectAllocationStatus.AVAILABLE_FOR_SELECTION,
      assignedUserId: adminUserId,
      leadScores: {
        create: {
          digitalPresenceScore: 0,
          hiringActivityScore: 0,
          techStackFitScore: 0,
          fundingRevenueScore: 0,
          projectUrgencyScore: 0,
          budgetClarityScore: 0,
          recordedLeadScore: 18,
          calculatedLeadScore: 0,
        },
      },
      activities: {
        create: {
          userId: adminUserId,
          type: ActivityType.SYSTEM_EVENT,
          title: "Initial Record Seeded",
          description: "Seeded exact Destination Cafe intake dossier record with recordedLeadScore discrepancy support.",
        },
      },
      tasks: {
        create: {
          title: "Prepare CRM Proposal for Destination Cafe",
          description: "Draft enterprise web solution proposal and outline custom lead management module.",
          priority: Priority.HIGH,
          status: TaskStatus.PENDING,
          dueDate: new Date(Date.now() + 86400000 * 2), // 2 days in future
          assignedUserId: salesUserId,
        },
      },
    },
  });

  // 4. Seed Synthetic DEMO Records for Dashboard Visualization
  const demoLeadsData = [
    {
      company: "[DEMO] Apex Tech Solutions",
      domain: "Information Technology",
      location: "Banjara Hills, Hyderabad, Telangana",
      website: "https://apextech.demo",
      contactPerson: "Rajesh Kumar",
      designation: "CTO",
      phone: "+91 98765 43210",
      email: "rajesh@apextech.demo",
      priority: Priority.HIGH,
      status: LeadStatus.QUALIFIED,
      source: "Website Lead",
      digitalPresenceScore: 4,
      hiringActivityScore: 5,
      techStackFitScore: 4,
      fundingRevenueScore: 3,
      projectUrgencyScore: 5,
      budgetClarityScore: 4,
      calculatedLeadScore: 25,
      recordedLeadScore: 25,
      projectAllocationStatus: ProjectAllocationStatus.AVAILABLE_FOR_SELECTION,
      assignedUserId: salesUserId,
    },
    {
      company: "[DEMO] Metro Logistics",
      domain: "Supply Chain",
      location: "Gachibowli, Hyderabad, Telangana",
      website: "https://metrologistics.demo",
      contactPerson: "Ananya Sharma",
      designation: "Head of Operations",
      phone: "+91 98765 11223",
      email: "ananya@metrologistics.demo",
      priority: Priority.URGENT,
      status: LeadStatus.IN_PROGRESS,
      source: "LinkedIn Outreach",
      digitalPresenceScore: 3,
      hiringActivityScore: 3,
      techStackFitScore: 5,
      fundingRevenueScore: 4,
      projectUrgencyScore: 4,
      budgetClarityScore: 3,
      calculatedLeadScore: 22,
      recordedLeadScore: 22,
      projectAllocationStatus: ProjectAllocationStatus.ALLOCATED,
      assignedUserId: salesUserId,
    },
    {
      company: "[DEMO] SunRise Retail Chains",
      domain: "Retail & E-commerce",
      location: "Madhapur, Hyderabad, Telangana",
      website: "https://sunriseretail.demo",
      contactPerson: "Vikram Reddy",
      designation: "VP Sales",
      phone: "+91 98765 99887",
      email: "vikram@sunriseretail.demo",
      priority: Priority.MEDIUM,
      status: LeadStatus.CONTACTED,
      source: "Partner Referral",
      digitalPresenceScore: 2,
      hiringActivityScore: 2,
      techStackFitScore: 3,
      fundingRevenueScore: 2,
      projectUrgencyScore: 3,
      budgetClarityScore: 2,
      calculatedLeadScore: 14,
      recordedLeadScore: 14,
      projectAllocationStatus: ProjectAllocationStatus.UNASSIGNED,
      assignedUserId: managerUserId,
    },
    {
      company: "[DEMO] BlueOcean Health Tech",
      domain: "Healthcare",
      location: "HITEC City, Hyderabad, Telangana",
      website: "https://blueocean.demo",
      contactPerson: "Dr. Priya Patel",
      designation: "Director of Digital",
      phone: "+91 98765 33445",
      email: "priya@blueocean.demo",
      priority: Priority.HIGH,
      status: LeadStatus.CONVERTED,
      source: "Direct Inbound",
      digitalPresenceScore: 5,
      hiringActivityScore: 4,
      techStackFitScore: 5,
      fundingRevenueScore: 5,
      projectUrgencyScore: 4,
      budgetClarityScore: 5,
      calculatedLeadScore: 28,
      recordedLeadScore: 28,
      projectAllocationStatus: ProjectAllocationStatus.COMPLETED,
      assignedUserId: salesUserId,
    },
  ];

  for (const demoLead of demoLeadsData) {
    const createdLead = await prisma.lead.create({
      data: {
        company: demoLead.company,
        domain: demoLead.domain,
        location: demoLead.location,
        website: demoLead.website,
        contactPerson: demoLead.contactPerson,
        designation: demoLead.designation,
        phone: demoLead.phone,
        email: demoLead.email,
        priority: demoLead.priority,
        status: demoLead.status,
        source: demoLead.source,
        dateAdded: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 10)),
        digitalPresenceScore: demoLead.digitalPresenceScore,
        hiringActivityScore: demoLead.hiringActivityScore,
        techStackFitScore: demoLead.techStackFitScore,
        fundingRevenueScore: demoLead.fundingRevenueScore,
        projectUrgencyScore: demoLead.projectUrgencyScore,
        budgetClarityScore: demoLead.budgetClarityScore,
        calculatedLeadScore: demoLead.calculatedLeadScore,
        recordedLeadScore: demoLead.recordedLeadScore,
        projectAllocationStatus: demoLead.projectAllocationStatus,
        assignedUserId: demoLead.assignedUserId,
        contacts: {
          create: {
            name: demoLead.contactPerson,
            designation: demoLead.designation,
            phone: demoLead.phone,
            email: demoLead.email,
            isPrimary: true,
          },
        },
        activities: {
          create: {
            userId: demoLead.assignedUserId,
            type: ActivityType.CALL,
            title: `Outreach Call with ${demoLead.contactPerson}`,
            description: `Discussed technical requirements for ${demoLead.company}.`,
          },
        },
      },
    });

    // Seed sample opportunity for demo lead
    if (demoLead.status === LeadStatus.QUALIFIED || demoLead.status === LeadStatus.CONVERTED || demoLead.status === LeadStatus.IN_PROGRESS) {
      await prisma.opportunity.create({
        data: {
          name: `${demoLead.company} Enterprise Deal`,
          leadId: createdLead.id,
          stage: demoLead.status === LeadStatus.CONVERTED ? OpportunityStage.CLOSED_WON : OpportunityStage.PROPOSAL,
          value: 45000,
          assignedUserId: demoLead.assignedUserId,
          closeDate: new Date(Date.now() + 86400000 * 14),
        },
      });
    }

    // Seed sample overdue task
    await prisma.task.create({
      data: {
        title: `Follow up on contract details with ${demoLead.company}`,
        description: "Review legal clauses and pricing breakdown.",
        priority: Priority.URGENT,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() - 86400000 * 1), // Overdue by 1 day
        leadId: createdLead.id,
        assignedUserId: demoLead.assignedUserId,
      },
    });
  }

  console.log("Seeded exact Destination Cafe lead ID:", destinationCafeLead.id);
  console.log("Seeded 4 synthetic DEMO records for dashboard visualizations.");
  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
