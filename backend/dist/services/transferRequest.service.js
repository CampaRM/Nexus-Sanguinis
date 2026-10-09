"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferRequestService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../config/prisma");
class TransferRequestService {
    async getAll(status) {
        return prisma_1.prisma.transferRequest.findMany({
            where: status ? { status } : {},
            include: {
                requesting_center: true,
                supplying_center: true,
                transfer_details: {
                    include: {
                        blood_unit: true,
                    },
                },
            },
            orderBy: { request_date: 'desc' },
        });
    }
    async getById(id_transfer_request) {
        const request = await prisma_1.prisma.transferRequest.findUnique({
            where: { id_transfer_request },
            include: {
                requesting_center: true,
                supplying_center: true,
                transfer_details: {
                    include: {
                        blood_unit: true,
                    },
                },
            },
        });
        if (!request) {
            const error = new Error(`Transfer request #${id_transfer_request} not found`);
            error.statusCode = 404;
            throw error;
        }
        return request;
    }
    async create(data) {
        if (data.id_requesting_center === data.id_supplying_center) {
            const error = new Error('Requesting center and supplying center cannot be the same');
            error.statusCode = 400;
            throw error;
        }
        return prisma_1.prisma.transferRequest.create({
            data: {
                id_requesting_center: data.id_requesting_center,
                id_supplying_center: data.id_supplying_center,
                blood_type: data.blood_type,
                quantity: data.quantity,
                status: client_1.TransferRequestStatus.PENDING,
            },
            include: {
                requesting_center: true,
                supplying_center: true,
            },
        });
    }
    /**
     * ACID Transactional Process:
     * Approves transfer request, verifies unit availability at supplying center,
     * updates inventory ownership, creates transfer details, and writes audit trail.
     */
    async processTransfer(id_transfer_request, dto, id_user) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const request = await tx.transferRequest.findUnique({
                where: { id_transfer_request },
                include: {
                    supplying_center: true,
                    requesting_center: true,
                },
            });
            if (!request) {
                const error = new Error(`Transfer request #${id_transfer_request} not found`);
                error.statusCode = 404;
                throw error;
            }
            if (request.status !== client_1.TransferRequestStatus.PENDING) {
                const error = new Error(`Cannot process request in status '${request.status}'`);
                error.statusCode = 400;
                throw error;
            }
            if (dto.action === 'REJECT') {
                return tx.transferRequest.update({
                    where: { id_transfer_request },
                    data: { status: client_1.TransferRequestStatus.REJECTED },
                    include: { requesting_center: true, supplying_center: true },
                });
            }
            // Action: APPROVE
            let unitsToTransfer = [];
            if (dto.id_blood_units && dto.id_blood_units.length > 0) {
                if (dto.id_blood_units.length !== request.quantity) {
                    const error = new Error(`Quantity mismatch: Request requires ${request.quantity} units, but ${dto.id_blood_units.length} were selected`);
                    error.statusCode = 400;
                    throw error;
                }
                const foundUnits = await tx.bloodUnit.findMany({
                    where: {
                        id_blood_unit: { in: dto.id_blood_units },
                        id_medical_center: request.id_supplying_center,
                        blood_type: request.blood_type,
                        status: { in: [client_1.BloodUnitStatus.AVAILABLE, client_1.BloodUnitStatus.NEAR_EXPIRATION] },
                    },
                });
                if (foundUnits.length !== dto.id_blood_units.length) {
                    const error = new Error('One or more selected blood units are not available at the supplying center or mismatch blood type');
                    error.statusCode = 400;
                    throw error;
                }
                unitsToTransfer = foundUnits;
            }
            else {
                // FEFO (First Expired, First Out) selection
                const candidateUnits = await tx.bloodUnit.findMany({
                    where: {
                        id_medical_center: request.id_supplying_center,
                        blood_type: request.blood_type,
                        status: { in: [client_1.BloodUnitStatus.AVAILABLE, client_1.BloodUnitStatus.NEAR_EXPIRATION] },
                    },
                    orderBy: { expiration_date: 'asc' },
                    take: request.quantity,
                });
                if (candidateUnits.length < request.quantity) {
                    const error = new Error(`Insufficient stock: Supplying center only has ${candidateUnits.length} available unit(s) of type ${request.blood_type}, but ${request.quantity} needed`);
                    error.statusCode = 400;
                    throw error;
                }
                unitsToTransfer = candidateUnits;
            }
            // 1. Mark request as COMPLETED
            const updatedRequest = await tx.transferRequest.update({
                where: { id_transfer_request },
                data: { status: client_1.TransferRequestStatus.COMPLETED },
            });
            // 2. Insert TransferDetail & Update Blood Units & Log Movement History
            for (const unit of unitsToTransfer) {
                await tx.transferDetail.create({
                    data: {
                        id_transfer_request: request.id_transfer_request,
                        id_blood_unit: unit.id_blood_unit,
                    },
                });
                await tx.bloodUnit.update({
                    where: { id_blood_unit: unit.id_blood_unit },
                    data: {
                        id_medical_center: request.id_requesting_center,
                        status: client_1.BloodUnitStatus.AVAILABLE,
                    },
                });
                await tx.movementHistory.create({
                    data: {
                        id_blood_unit: unit.id_blood_unit,
                        id_user,
                        action: `TRANSFER_COMPLETED: Reassigned from ${request.supplying_center.name} (ID: ${request.id_supplying_center}) to ${request.requesting_center.name} (ID: ${request.id_requesting_center}) via Transfer Request #${request.id_transfer_request}`,
                    },
                });
            }
            return tx.transferRequest.findUnique({
                where: { id_transfer_request },
                include: {
                    requesting_center: true,
                    supplying_center: true,
                    transfer_details: {
                        include: { blood_unit: true },
                    },
                },
            });
        });
    }
}
exports.TransferRequestService = TransferRequestService;
