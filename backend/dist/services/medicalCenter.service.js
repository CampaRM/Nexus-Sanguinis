"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalCenterService = void 0;
const prisma_1 = require("../config/prisma");
class MedicalCenterService {
    async getAll() {
        return prisma_1.prisma.medicalCenter.findMany({
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
    async getById(id_medical_center) {
        const center = await prisma_1.prisma.medicalCenter.findUnique({
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
            const error = new Error(`Medical center with ID ${id_medical_center} not found`);
            error.statusCode = 404;
            throw error;
        }
        return center;
    }
    async create(data) {
        return prisma_1.prisma.medicalCenter.create({
            data,
        });
    }
    async update(id_medical_center, data) {
        await this.getById(id_medical_center);
        return prisma_1.prisma.medicalCenter.update({
            where: { id_medical_center },
            data,
        });
    }
    async delete(id_medical_center) {
        await this.getById(id_medical_center);
        return prisma_1.prisma.medicalCenter.delete({
            where: { id_medical_center },
        });
    }
}
exports.MedicalCenterService = MedicalCenterService;
