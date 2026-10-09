"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferRequestController = void 0;
const transferRequest_service_1 = require("../services/transferRequest.service");
const transferRequestService = new transferRequest_service_1.TransferRequestService();
class TransferRequestController {
    async getAll(req, res, next) {
        try {
            const status = req.query.status;
            const requests = await transferRequestService.getAll(status);
            res.status(200).json({ success: true, data: requests });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const request = await transferRequestService.getById(id);
            res.status(200).json({ success: true, data: request });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const request = await transferRequestService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Transfer request submitted successfully',
                data: request,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async processTransfer(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const userId = req.user.id_user;
            const result = await transferRequestService.processTransfer(id, req.body, userId);
            res.status(200).json({
                success: true,
                message: `Transfer request processed: ${req.body.action}`,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TransferRequestController = TransferRequestController;
