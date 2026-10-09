"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodUnitController = void 0;
const bloodUnit_service_1 = require("../services/bloodUnit.service");
const bloodUnitService = new bloodUnit_service_1.BloodUnitService();
class BloodUnitController {
    async getFiltered(req, res, next) {
        try {
            const result = await bloodUnitService.getFiltered(req.query);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const unit = await bloodUnitService.getById(id);
            res.status(200).json({ success: true, data: unit });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const userId = req.user.id_user;
            const unit = await bloodUnitService.create(req.body, userId);
            res.status(201).json({ success: true, message: 'Blood unit registered', data: unit });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const userId = req.user.id_user;
            const unit = await bloodUnitService.update(id, req.body, userId);
            res.status(200).json({ success: true, message: 'Blood unit updated', data: unit });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const userId = req.user.id_user;
            await bloodUnitService.delete(id, userId);
            res.status(200).json({ success: true, message: 'Blood unit discarded successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BloodUnitController = BloodUnitController;
