"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalCenterController = void 0;
const medicalCenter_service_1 = require("../services/medicalCenter.service");
const medicalCenterService = new medicalCenter_service_1.MedicalCenterService();
class MedicalCenterController {
    async getAll(req, res, next) {
        try {
            const centers = await medicalCenterService.getAll();
            res.status(200).json({ success: true, data: centers });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const center = await medicalCenterService.getById(id);
            res.status(200).json({ success: true, data: center });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const center = await medicalCenterService.create(req.body);
            res.status(201).json({ success: true, message: 'Medical center created', data: center });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const center = await medicalCenterService.update(id, req.body);
            res.status(200).json({ success: true, message: 'Medical center updated', data: center });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            await medicalCenterService.delete(id);
            res.status(200).json({ success: true, message: 'Medical center deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MedicalCenterController = MedicalCenterController;
