import { BloodUnitStatus, TransferRequestStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

export class DashboardService {
  async getMetrics(id_medical_center?: number) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const centerFilter = id_medical_center ? { id_medical_center } : {};

    // Metric 1: Total Units by Blood Type & Rh Factor
    const unitsGrouped = await prisma.bloodUnit.groupBy({
      by: ['blood_type', 'rh_factor'],
      where: {
        ...centerFilter,
        status: { in: [BloodUnitStatus.AVAILABLE, BloodUnitStatus.NEAR_EXPIRATION] },
      },
      _count: {
        id_blood_unit: true,
      },
    });

    const unitsByBloodType: Record<string, number> = {
      'A+': 0,
      'A-': 0,
      'B+': 0,
      'B-': 0,
      'AB+': 0,
      'AB-': 0,
      'O+': 0,
      'O-': 0,
    };

    let totalAvailableUnits = 0;
    unitsGrouped.forEach((g) => {
      const rhSymbol = g.rh_factor === 'POSITIVE' ? '+' : '-';
      const key = `${g.blood_type}${rhSymbol}`;
      unitsByBloodType[key] = g._count.id_blood_unit;
      totalAvailableUnits += g._count.id_blood_unit;
    });

    // Metric 2: Expiration Alerts < 7 days
    const expirationAlerts = await prisma.bloodUnit.findMany({
      where: {
        ...centerFilter,
        status: { in: [BloodUnitStatus.AVAILABLE, BloodUnitStatus.NEAR_EXPIRATION] },
        expiration_date: {
          lte: sevenDaysFromNow,
        },
      },
      include: {
        medical_center: {
          select: { id_medical_center: true, name: true },
        },
      },
      orderBy: { expiration_date: 'asc' },
    });

    // Metric 3: Pending Transfer Requests
    const pendingRequests = await prisma.transferRequest.findMany({
      where: {
        status: TransferRequestStatus.PENDING,
        ...(id_medical_center && {
          OR: [
            { id_requesting_center: id_medical_center },
            { id_supplying_center: id_medical_center },
          ],
        }),
      },
      include: {
        requesting_center: { select: { name: true } },
        supplying_center: { select: { name: true } },
      },
      orderBy: { request_date: 'desc' },
    });

    const totalCenters = await prisma.medicalCenter.count();
    const totalMovements = await prisma.movementHistory.count();

    return {
      metrics: {
        // Metric 1
        bloodTypeBreakdown: unitsByBloodType,
        totalAvailableUnits,

        // Metric 2
        expiringSoonCount: expirationAlerts.length,
        expiringSoonUnits: expirationAlerts.map((unit) => {
          const diffMs = new Date(unit.expiration_date).getTime() - now.getTime();
          const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          return {
            id_blood_unit: unit.id_blood_unit,
            blood_type: `${unit.blood_type}${unit.rh_factor === 'POSITIVE' ? '+' : '-'}`,
            expiration_date: unit.expiration_date,
            days_remaining: daysLeft,
            medical_center: unit.medical_center.name,
          };
        }),

        // Metric 3
        pendingRequestsCount: pendingRequests.length,
        pendingRequestsList: pendingRequests,
      },
      summary: {
        totalCenters,
        totalMovements,
      },
    };
  }
}
