import { TransferRequestStatus, BloodUnitStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateTransferRequestDto, ProcessTransferDto } from '../dtos/transferRequest.dto';

export class TransferRequestService {
  async getAll(status?: TransferRequestStatus) {
    return prisma.transferRequest.findMany({
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

  async getById(id_transfer_request: number) {
    const request = await prisma.transferRequest.findUnique({
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
      const error: any = new Error(`Transfer request #${id_transfer_request} not found`);
      error.statusCode = 404;
      throw error;
    }

    return request;
  }

  async create(data: CreateTransferRequestDto) {
    if (data.id_requesting_center === data.id_supplying_center) {
      const error: any = new Error('Requesting center and supplying center cannot be the same');
      error.statusCode = 400;
      throw error;
    }

    return prisma.transferRequest.create({
      data: {
        id_requesting_center: data.id_requesting_center,
        id_supplying_center: data.id_supplying_center,
        blood_type: data.blood_type,
        quantity: data.quantity,
        status: TransferRequestStatus.PENDING,
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
  async processTransfer(id_transfer_request: number, dto: ProcessTransferDto, id_user: number) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.transferRequest.findUnique({
        where: { id_transfer_request },
        include: {
          supplying_center: true,
          requesting_center: true,
        },
      });

      if (!request) {
        const error: any = new Error(`Transfer request #${id_transfer_request} not found`);
        error.statusCode = 404;
        throw error;
      }

      if (request.status !== TransferRequestStatus.PENDING) {
        const error: any = new Error(`Cannot process request in status '${request.status}'`);
        error.statusCode = 400;
        throw error;
      }

      if (dto.action === 'REJECT') {
        return tx.transferRequest.update({
          where: { id_transfer_request },
          data: { status: TransferRequestStatus.REJECTED },
          include: { requesting_center: true, supplying_center: true },
        });
      }

      // Action: APPROVE
      let unitsToTransfer: { id_blood_unit: number; blood_type: string }[] = [];

      if (dto.id_blood_units && dto.id_blood_units.length > 0) {
        if (dto.id_blood_units.length !== request.quantity) {
          const error: any = new Error(
            `Quantity mismatch: Request requires ${request.quantity} units, but ${dto.id_blood_units.length} were selected`
          );
          error.statusCode = 400;
          throw error;
        }

        const foundUnits = await tx.bloodUnit.findMany({
          where: {
            id_blood_unit: { in: dto.id_blood_units },
            id_medical_center: request.id_supplying_center,
            blood_type: request.blood_type,
            status: { in: [BloodUnitStatus.AVAILABLE, BloodUnitStatus.NEAR_EXPIRATION] },
          },
        });

        if (foundUnits.length !== dto.id_blood_units.length) {
          const error: any = new Error(
            'One or more selected blood units are not available at the supplying center or mismatch blood type'
          );
          error.statusCode = 400;
          throw error;
        }

        unitsToTransfer = foundUnits;
      } else {
        // FEFO (First Expired, First Out) selection
        const candidateUnits = await tx.bloodUnit.findMany({
          where: {
            id_medical_center: request.id_supplying_center,
            blood_type: request.blood_type,
            status: { in: [BloodUnitStatus.AVAILABLE, BloodUnitStatus.NEAR_EXPIRATION] },
          },
          orderBy: { expiration_date: 'asc' },
          take: request.quantity,
        });

        if (candidateUnits.length < request.quantity) {
          const error: any = new Error(
            `Insufficient stock: Supplying center only has ${candidateUnits.length} available unit(s) of type ${request.blood_type}, but ${request.quantity} needed`
          );
          error.statusCode = 400;
          throw error;
        }

        unitsToTransfer = candidateUnits;
      }

      // 1. Mark request as COMPLETED
      const updatedRequest = await tx.transferRequest.update({
        where: { id_transfer_request },
        data: { status: TransferRequestStatus.COMPLETED },
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
            status: BloodUnitStatus.AVAILABLE,
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
