import { prisma } from '../config/prisma';

export class MovementHistoryService {
  async getAll(id_blood_unit?: number, id_user?: number, limit = 50) {
    return prisma.movementHistory.findMany({
      where: {
        ...(id_blood_unit && { id_blood_unit }),
        ...(id_user && { id_user }),
      },
      include: {
        blood_unit: {
          select: {
            id_blood_unit: true,
            blood_type: true,
            rh_factor: true,
            status: true,
            medical_center: {
              select: { id_medical_center: true, name: true },
            },
          },
        },
        user: {
          select: {
            id_user: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
