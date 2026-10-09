import { PrismaClient, RoleName, BloodType, RhFactor, BloodUnitStatus, TransferRequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando siembra (seed) de base de datos Nexus Sanguinis ---');

  // 1. Roles
  console.log('Configurando Roles (id 1: ADMIN_GENERAL, id 2: BANK_MANAGER)...');
  const adminRole = await prisma.role.upsert({
    where: { id_role: 1 },
    update: { role_name: RoleName.ADMIN_GENERAL },
    create: {
      id_role: 1,
      role_name: RoleName.ADMIN_GENERAL,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { id_role: 2 },
    update: { role_name: RoleName.BANK_MANAGER },
    create: {
      id_role: 2,
      role_name: RoleName.BANK_MANAGER,
    },
  });

  // 2. Centros Médicos (Guatemala y Globales)
  console.log('Configurando Centros Médicos oficiales...');
  const center1 = await prisma.medicalCenter.upsert({
    where: { id_medical_center: 1 },
    update: {
      name: 'Banco Nacional de Sangre - San Juan de Dios',
      type: 'Hospital Público',
      address: '10a Avenida 1-47 Zona 1, Guatemala',
      phone: '+502 2253-0422',
    },
    create: {
      id_medical_center: 1,
      name: 'Banco Nacional de Sangre - San Juan de Dios',
      type: 'Hospital Público',
      address: '10a Avenida 1-47 Zona 1, Guatemala',
      phone: '+502 2253-0422',
    },
  });

  const center2 = await prisma.medicalCenter.upsert({
    where: { id_medical_center: 2 },
    update: {
      name: 'Centro Nacional de Transfusión Sanguínea (CNTS)',
      type: 'Centro Referencial',
      address: 'Calzada Roosevelt Zona 11, Guatemala',
      phone: '+502 2471-1234',
    },
    create: {
      id_medical_center: 2,
      name: 'Centro Nacional de Transfusión Sanguínea (CNTS)',
      type: 'Centro Referencial',
      address: 'Calzada Roosevelt Zona 11, Guatemala',
      phone: '+502 2471-1234',
    },
  });

  const center3 = await prisma.medicalCenter.upsert({
    where: { id_medical_center: 3 },
    update: {
      name: 'American Red Cross Blood Services',
      type: 'Global Network',
      address: '2025 E St NW, Washington, DC, USA',
      phone: '+1 800-733-2767',
    },
    create: {
      id_medical_center: 3,
      name: 'American Red Cross Blood Services',
      type: 'Global Network',
      address: '2025 E St NW, Washington, DC, USA',
      phone: '+1 800-733-2767',
    },
  });

  // 3. Usuarios Principales
  console.log('Configurando Usuarios y Credenciales...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', salt);
  const managerPasswordHash = await bcrypt.hash('Manager123!', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nexus.org' },
    update: {
      full_name: 'Dr. Gregory House (Admin)',
      password_hash: adminPasswordHash,
      id_role: adminRole.id_role,
      id_medical_center: center1.id_medical_center,
    },
    create: {
      full_name: 'Dr. Gregory House (Admin)',
      email: 'admin@nexus.org',
      password_hash: adminPasswordHash,
      id_role: adminRole.id_role,
      id_medical_center: center1.id_medical_center,
    },
  });

  const managerGuatemala = await prisma.user.upsert({
    where: { email: 'manager.metro@nexus.org' },
    update: {
      full_name: 'Dra. Allison Cameron (CNTS)',
      password_hash: managerPasswordHash,
      id_role: managerRole.id_role,
      id_medical_center: center2.id_medical_center,
    },
    create: {
      full_name: 'Dra. Allison Cameron (CNTS)',
      email: 'manager.metro@nexus.org',
      password_hash: managerPasswordHash,
      id_role: managerRole.id_role,
      id_medical_center: center2.id_medical_center,
    },
  });

  const managerGlobal = await prisma.user.upsert({
    where: { email: 'manager.redcross@nexus.org' },
    update: {
      full_name: 'Dr. James Wilson (Red Cross)',
      password_hash: managerPasswordHash,
      id_role: managerRole.id_role,
      id_medical_center: center3.id_medical_center,
    },
    create: {
      full_name: 'Dr. James Wilson (Red Cross)',
      email: 'manager.redcross@nexus.org',
      password_hash: managerPasswordHash,
      id_role: managerRole.id_role,
      id_medical_center: center3.id_medical_center,
    },
  });

  // Limpiar tablas transaccionales dependientes para permitir idempotencia
  console.log('Limpiando tablas transaccionales para re-siembra limpia...');
  await prisma.transferDetail.deleteMany({});
  await prisma.movementHistory.deleteMany({});
  await prisma.transferRequest.deleteMany({});
  await prisma.bloodUnit.deleteMany({});

  // 4. Unidades de Sangre (A, B, O, AB con positivos, negativos, AVAILABLE, NEAR_EXPIRATION, EXPIRED)
  console.log('Generando unidades de sangre representativas...');
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const daysAhead = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const bloodUnitRecords = [
    // --- ESTADO: AVAILABLE ---
    // Tipo O
    {
      blood_type: BloodType.O,
      rh_factor: RhFactor.POSITIVE,
      extraction_date: daysAgo(4),
      expiration_date: daysAhead(38),
      status: BloodUnitStatus.AVAILABLE,
      id_medical_center: center1.id_medical_center,
    },
    {
      blood_type: BloodType.O,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(2),
      expiration_date: daysAhead(40),
      status: BloodUnitStatus.AVAILABLE,
      id_medical_center: center1.id_medical_center,
    },
    // Tipo A
    {
      blood_type: BloodType.A,
      rh_factor: RhFactor.POSITIVE,
      extraction_date: daysAgo(5),
      expiration_date: daysAhead(37),
      status: BloodUnitStatus.AVAILABLE,
      id_medical_center: center2.id_medical_center,
    },
    {
      blood_type: BloodType.A,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(6),
      expiration_date: daysAhead(36),
      status: BloodUnitStatus.AVAILABLE,
      id_medical_center: center2.id_medical_center,
    },
    // Tipo B
    {
      blood_type: BloodType.B,
      rh_factor: RhFactor.POSITIVE,
      extraction_date: daysAgo(3),
      expiration_date: daysAhead(39),
      status: BloodUnitStatus.AVAILABLE,
      id_medical_center: center3.id_medical_center,
    },
    {
      blood_type: BloodType.B,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(7),
      expiration_date: daysAhead(35),
      status: BloodUnitStatus.AVAILABLE,
      id_medical_center: center3.id_medical_center,
    },
    // Tipo AB
    {
      blood_type: BloodType.AB,
      rh_factor: RhFactor.POSITIVE,
      extraction_date: daysAgo(8),
      expiration_date: daysAhead(34),
      status: BloodUnitStatus.AVAILABLE,
      id_medical_center: center1.id_medical_center,
    },
    {
      blood_type: BloodType.AB,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(5),
      expiration_date: daysAhead(37),
      status: BloodUnitStatus.AVAILABLE,
      id_medical_center: center2.id_medical_center,
    },

    // --- ESTADO: NEAR_EXPIRATION (< 7 días restantes) ---
    {
      blood_type: BloodType.O,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(39),
      expiration_date: daysAhead(3),
      status: BloodUnitStatus.NEAR_EXPIRATION,
      id_medical_center: center1.id_medical_center,
    },
    {
      blood_type: BloodType.A,
      rh_factor: RhFactor.POSITIVE,
      extraction_date: daysAgo(38),
      expiration_date: daysAhead(4),
      status: BloodUnitStatus.NEAR_EXPIRATION,
      id_medical_center: center2.id_medical_center,
    },
    {
      blood_type: BloodType.B,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(40),
      expiration_date: daysAhead(2),
      status: BloodUnitStatus.NEAR_EXPIRATION,
      id_medical_center: center3.id_medical_center,
    },
    {
      blood_type: BloodType.AB,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(37),
      expiration_date: daysAhead(5),
      status: BloodUnitStatus.NEAR_EXPIRATION,
      id_medical_center: center1.id_medical_center,
    },

    // --- ESTADO: EXPIRED (Fecha vencida) ---
    {
      blood_type: BloodType.B,
      rh_factor: RhFactor.POSITIVE,
      extraction_date: daysAgo(50),
      expiration_date: daysAgo(8),
      status: BloodUnitStatus.EXPIRED,
      id_medical_center: center1.id_medical_center,
    },
    {
      blood_type: BloodType.O,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(45),
      expiration_date: daysAgo(3),
      status: BloodUnitStatus.EXPIRED,
      id_medical_center: center2.id_medical_center,
    },
    {
      blood_type: BloodType.A,
      rh_factor: RhFactor.NEGATIVE,
      extraction_date: daysAgo(48),
      expiration_date: daysAgo(6),
      status: BloodUnitStatus.EXPIRED,
      id_medical_center: center3.id_medical_center,
    },
  ];

  const createdUnits = [];
  for (const item of bloodUnitRecords) {
    const unit = await prisma.bloodUnit.create({
      data: item,
    });
    createdUnits.push(unit);

    // Registro de auditoría/movimiento inicial
    await prisma.movementHistory.create({
      data: {
        id_blood_unit: unit.id_blood_unit,
        id_user: adminUser.id_user,
        action: `EXTRACCIÓN: Unidad ${unit.blood_type}${unit.rh_factor === RhFactor.POSITIVE ? '+' : '-'} registrada en centro ${unit.id_medical_center}`,
        timestamp: item.extraction_date,
      },
    });
  }

  // 5. Solicitudes de Transferencia Inter-Centro
  console.log('Generando solicitudes de transferencia y trazabilidad...');
  // Solicitud pendiente: CNTS solicita sangre tipo O al San Juan de Dios
  const pendingTransfer = await prisma.transferRequest.create({
    data: {
      id_requesting_center: center2.id_medical_center,
      id_supplying_center: center1.id_medical_center,
      blood_type: BloodType.O,
      quantity: 2,
      status: TransferRequestStatus.PENDING,
      request_date: daysAgo(1),
    },
  });

  // Solicitud completada: San Juan de Dios recibe de Red Cross
  const completedTransfer = await prisma.transferRequest.create({
    data: {
      id_requesting_center: center1.id_medical_center,
      id_supplying_center: center3.id_medical_center,
      blood_type: BloodType.A,
      quantity: 1,
      status: TransferRequestStatus.COMPLETED,
      request_date: daysAgo(3),
    },
  });

  // Vincular detalle a la transferencia completada
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
        action: `TRANSFERENCIA_COMPLETADA: Despachada desde Centro ${center3.id_medical_center} hacia Centro ${center1.id_medical_center}`,
      },
    });
  }

  console.log('✅ Base de datos nexus_sanguinis_in5bv sincronizada y sembrada con éxito.');
  console.log({
    roles: 2,
    centrosMedicos: 3,
    usuarios: 3,
    unidadesSangre: createdUnits.length,
    solicitudesTransferencia: 2,
  });
}

main()
  .catch((e) => {
    console.error('Error durante la siembra de la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
