import { PrismaClient, RoleName, BloodType, RhFactor, BloodUnitStatus, TransferRequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Nexus Sanguinis database...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { role_name: RoleName.ADMIN_GENERAL },
    update: {},
    create: { role_name: RoleName.ADMIN_GENERAL },
  });

  const managerRole = await prisma.role.upsert({
    where: { role_name: RoleName.BANK_MANAGER },
    update: {},
    create: { role_name: RoleName.BANK_MANAGER },
  });

  // 2. Medical Centers
  const redCrossCenter = await prisma.medicalCenter.upsert({
    where: { id_medical_center: 1 },
    update: {},
    create: {
      name: 'Central Blood Bank - Red Cross',
      type: 'REGIONAL_BANK',
      address: '742 Evergreen Terrace, North Wing',
      phone: '+1-555-0199',
    },
  });

  const metroHospital = await prisma.medicalCenter.upsert({
    where: { id_medical_center: 2 },
    update: {},
    create: {
      name: 'Metropolitan General Hospital',
      type: 'HOSPITAL',
      address: '100 Medical Plaza, District 4',
      phone: '+1-555-0245',
    },
  });

  const stJudeClinic = await prisma.medicalCenter.upsert({
    where: { id_medical_center: 3 },
    update: {},
    create: {
      name: 'St. Jude Clinical Center',
      type: 'CLINIC',
      address: '88 Healthcare Blvd, South Sector',
      phone: '+1-555-0312',
    },
  });

  const traumaCenter = await prisma.medicalCenter.upsert({
    where: { id_medical_center: 4 },
    update: {},
    create: {
      name: 'University Trauma & Research Center',
      type: 'HOSPITAL',
      address: '450 University Way, West District',
      phone: '+1-555-0487',
    },
  });

  // 3. Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', salt);
  const managerPasswordHash = await bcrypt.hash('Manager123!', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexus.org' },
    update: {},
    create: {
      full_name: 'Dr. Gregory House (Admin)',
      email: 'admin@nexus.org',
      password_hash: adminPasswordHash,
      id_role: adminRole.id_role,
      id_medical_center: redCrossCenter.id_medical_center,
    },
  });

  const metroManager = await prisma.user.upsert({
    where: { email: 'manager.metro@nexus.org' },
    update: {},
    create: {
      full_name: 'Dr. Allison Cameron',
      email: 'manager.metro@nexus.org',
      password_hash: managerPasswordHash,
      id_role: managerRole.id_role,
      id_medical_center: metroHospital.id_medical_center,
    },
  });

  const redCrossManager = await prisma.user.upsert({
    where: { email: 'manager.redcross@nexus.org' },
    update: {},
    create: {
      full_name: 'Dr. James Wilson',
      email: 'manager.redcross@nexus.org',
      password_hash: managerPasswordHash,
      id_role: managerRole.id_role,
      id_medical_center: redCrossCenter.id_medical_center,
    },
  });

  // 4. Blood Units
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const daysAhead = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const bloodUnitData = [
    // Available with healthy expiration dates (30-40 days)
    { blood_type: BloodType.O, rh_factor: RhFactor.POSITIVE, extraction_date: daysAgo(5), expiration_date: daysAhead(37), status: BloodUnitStatus.AVAILABLE, id_medical_center: redCrossCenter.id_medical_center },
    { blood_type: BloodType.O, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(3), expiration_date: daysAhead(39), status: BloodUnitStatus.AVAILABLE, id_medical_center: redCrossCenter.id_medical_center },
    { blood_type: BloodType.A, rh_factor: RhFactor.POSITIVE, extraction_date: daysAgo(6), expiration_date: daysAhead(36), status: BloodUnitStatus.AVAILABLE, id_medical_center: redCrossCenter.id_medical_center },
    { blood_type: BloodType.A, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(7), expiration_date: daysAhead(35), status: BloodUnitStatus.AVAILABLE, id_medical_center: redCrossCenter.id_medical_center },
    { blood_type: BloodType.B, rh_factor: RhFactor.POSITIVE, extraction_date: daysAgo(4), expiration_date: daysAhead(38), status: BloodUnitStatus.AVAILABLE, id_medical_center: metroHospital.id_medical_center },
    { blood_type: BloodType.B, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(2), expiration_date: daysAhead(40), status: BloodUnitStatus.AVAILABLE, id_medical_center: metroHospital.id_medical_center },
    { blood_type: BloodType.AB, rh_factor: RhFactor.POSITIVE, extraction_date: daysAgo(8), expiration_date: daysAhead(34), status: BloodUnitStatus.AVAILABLE, id_medical_center: metroHospital.id_medical_center },
    { blood_type: BloodType.AB, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(5), expiration_date: daysAhead(37), status: BloodUnitStatus.AVAILABLE, id_medical_center: stJudeClinic.id_medical_center },
    { blood_type: BloodType.O, rh_factor: RhFactor.POSITIVE, extraction_date: daysAgo(10), expiration_date: daysAhead(32), status: BloodUnitStatus.AVAILABLE, id_medical_center: stJudeClinic.id_medical_center },
    { blood_type: BloodType.A, rh_factor: RhFactor.POSITIVE, extraction_date: daysAgo(9), expiration_date: daysAhead(33), status: BloodUnitStatus.AVAILABLE, id_medical_center: traumaCenter.id_medical_center },

    // Units near expiration (< 7 days)
    { blood_type: BloodType.O, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(39), expiration_date: daysAhead(3), status: BloodUnitStatus.NEAR_EXPIRATION, id_medical_center: redCrossCenter.id_medical_center },
    { blood_type: BloodType.A, rh_factor: RhFactor.POSITIVE, extraction_date: daysAgo(38), expiration_date: daysAhead(4), status: BloodUnitStatus.NEAR_EXPIRATION, id_medical_center: metroHospital.id_medical_center },
    { blood_type: BloodType.B, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(40), expiration_date: daysAhead(2), status: BloodUnitStatus.NEAR_EXPIRATION, id_medical_center: stJudeClinic.id_medical_center },
    { blood_type: BloodType.AB, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(37), expiration_date: daysAhead(5), status: BloodUnitStatus.NEAR_EXPIRATION, id_medical_center: traumaCenter.id_medical_center },

    // Expired units
    { blood_type: BloodType.B, rh_factor: RhFactor.POSITIVE, extraction_date: daysAgo(50), expiration_date: daysAgo(8), status: BloodUnitStatus.EXPIRED, id_medical_center: redCrossCenter.id_medical_center },
    { blood_type: BloodType.O, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(45), expiration_date: daysAgo(3), status: BloodUnitStatus.EXPIRED, id_medical_center: metroHospital.id_medical_center },

    // Discarded units
    { blood_type: BloodType.A, rh_factor: RhFactor.NEGATIVE, extraction_date: daysAgo(20), expiration_date: daysAhead(22), status: BloodUnitStatus.DISCARDED, id_medical_center: redCrossCenter.id_medical_center },
  ];

  const createdUnits = [];
  for (const item of bloodUnitData) {
    const unit = await prisma.bloodUnit.create({
      data: item,
    });
    createdUnits.push(unit);

    // Initial movement log for extraction
    await prisma.movementHistory.create({
      data: {
        id_blood_unit: unit.id_blood_unit,
        id_user: adminUser.id_user,
        action: `EXTRACTION: Initial donation logged at center ${unit.id_medical_center}`,
        timestamp: item.extraction_date,
      },
    });
  }

  // 5. Transfer Requests
  // A Pending request from Metro Hospital to Red Cross
  const pendingTransfer = await prisma.transferRequest.create({
    data: {
      id_requesting_center: metroHospital.id_medical_center,
      id_supplying_center: redCrossCenter.id_medical_center,
      blood_type: BloodType.O,
      quantity: 2,
      status: TransferRequestStatus.PENDING,
      request_date: daysAgo(1),
    },
  });

  // A Completed transfer
  const completedTransfer = await prisma.transferRequest.create({
    data: {
      id_requesting_center: stJudeClinic.id_medical_center,
      id_supplying_center: redCrossCenter.id_medical_center,
      blood_type: BloodType.A,
      quantity: 1,
      status: TransferRequestStatus.COMPLETED,
      request_date: daysAgo(3),
    },
  });

  // Link one unit to the completed transfer
  if (createdUnits.length > 0) {
    const transferredUnit = createdUnits[0];
    await prisma.transferDetail.create({
      data: {
        id_transfer_request: completedTransfer.id_transfer_request,
        id_blood_unit: transferredUnit.id_blood_unit,
      },
    });

    await prisma.movementHistory.create({
      data: {
        id_blood_unit: transferredUnit.id_blood_unit,
        id_user: adminUser.id_user,
        action: `TRANSFER_COMPLETED: Dispatched from center ${redCrossCenter.id_medical_center} to center ${stJudeClinic.id_medical_center}`,
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log({
    roles: 2,
    medicalCenters: 4,
    users: 3,
    bloodUnits: createdUnits.length,
    transferRequests: 2,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
