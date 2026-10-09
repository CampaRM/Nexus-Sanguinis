import { prisma } from '../config/prisma';
import { CreateMedicalCenterDto, UpdateMedicalCenterDto } from '../dtos/medicalCenter.dto';

export class MedicalCenterService {
  async getAll() {
    return prisma.medicalCenter.findMany({
      include: {
        _count: {
          select: {
            blood_units: true,
            users: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id_medical_center: number) {
    const center = await prisma.medicalCenter.findUnique({
      where: { id_medical_center },
      include: {
        _count: {
          select: {
            blood_units: true,
            users: true,
          },
        },
      },
    });

    if (!center) {
      const error: any = new Error(`Medical center with ID ${id_medical_center} not found`);
      error.statusCode = 404;
      throw error;
    }

    return center;
  }

  async create(data: CreateMedicalCenterDto) {
    return prisma.medicalCenter.create({
      data,
    });
  }

  async update(id_medical_center: number, data: UpdateMedicalCenterDto) {
    await this.getById(id_medical_center);

    return prisma.medicalCenter.update({
      where: { id_medical_center },
      data,
    });
  }

  async delete(id_medical_center: number) {
    await this.getById(id_medical_center);

    return prisma.medicalCenter.delete({
      where: { id_medical_center },
    });
  }
}
