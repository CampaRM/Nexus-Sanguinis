import { Prisma, BloodUnitStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateBloodUnitDto, UpdateBloodUnitDto, BloodUnitFilterDto } from '../dtos/bloodUnit.dto';

export class BloodUnitService {
  async getFiltered(filters: BloodUnitFilterDto) {
    const where: Prisma.BloodUnitWhereInput = {};

    if (filters.blood_type) {
      where.blood_type = filters.blood_type;
    }
    if (filters.rh_factor) {
      where.rh_factor = filters.rh_factor;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.id_medical_center) {
      where.id_medical_center = filters.id_medical_center;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.bloodUnit.count({ where }),
      prisma.bloodUnit.findMany({
        where,
        skip,
        take: limit,
        include: {
          medical_center: {
            select: { id_medical_center: true, name: true, type: true },
          },
        },
        orderBy: { expiration_date: 'asc' },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id_blood_unit: number) {
    const unit = await prisma.bloodUnit.findUnique({
      where: { id_blood_unit },
      include: {
        medical_center: true,
        movement_history: {
          include: {
            user: { select: { id_user: true, full_name: true, email: true } },
          },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!unit) {
      const error: any = new Error(`Blood unit with ID ${id_blood_unit} not found`);
      error.statusCode = 404;
      throw error;
    }

    return unit;
  }

  async create(data: CreateBloodUnitDto, id_user: number) {
    return prisma.$transaction(async (tx) => {
      const unit = await tx.bloodUnit.create({
        data: {
          blood_type: data.blood_type,
          rh_factor: data.rh_factor,
          extraction_date: data.extraction_date,
          expiration_date: data.expiration_date,
          status: data.status || BloodUnitStatus.AVAILABLE,
          id_medical_center: data.id_medical_center,
        },
        include: {
          medical_center: true,
        },
      });

      await tx.movementHistory.create({
        data: {
          id_blood_unit: unit.id_blood_unit,
          id_user,
          action: `EXTRACTION: Unit registered at ${unit.medical_center.name} (${unit.blood_type}${unit.rh_factor === 'POSITIVE' ? '+' : '-'})`,
        },
      });

      return unit;
    });
  }

  async update(id_blood_unit: number, data: UpdateBloodUnitDto, id_user: number) {
    const existing = await this.getById(id_blood_unit);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.bloodUnit.update({
        where: { id_blood_unit },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.id_medical_center && { id_medical_center: data.id_medical_center }),
          ...(data.expiration_date && { expiration_date: data.expiration_date }),
        },
        include: {
          medical_center: true,
        },
      });

      const details = [];
      if (data.status && data.status !== existing.status) {
        details.push(`Status changed from ${existing.status} to ${data.status}`);
      }
      if (data.id_medical_center && data.id_medical_center !== existing.id_medical_center) {
        details.push(`Center reassigned to ID ${data.id_medical_center}`);
      }

      await tx.movementHistory.create({
        data: {
          id_blood_unit,
          id_user,
          action: `UPDATE: ${details.length > 0 ? details.join('; ') : 'Metadata updated'}`,
        },
      });

      return updated;
    });
  }

  async delete(id_blood_unit: number, id_user: number) {
    await this.getById(id_blood_unit);

    return prisma.$transaction(async (tx) => {
      await tx.movementHistory.create({
        data: {
          id_blood_unit,
          id_user,
          action: `DISCARD: Unit deleted from inventory`,
        },
      });

      // To preserve foreign key integrity on movement history, mark as DISCARDED or delete
      return tx.bloodUnit.update({
        where: { id_blood_unit },
        data: { status: BloodUnitStatus.DISCARDED },
      });
    });
  }
}
