"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementHistoryService = void 0;
const prisma_1 = require("../config/prisma");
class MovementHistoryService {
    async getAll(id_blood_unit, id_user, limit = 50) {
        return prisma_1.prisma.movementHistory.findMany({
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
exports.MovementHistoryService = MovementHistoryService;
