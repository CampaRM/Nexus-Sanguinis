"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const dashboardService = new dashboard_service_1.DashboardService();
class DashboardController {
    async getMetrics(req, res, next) {
        try {
            const centerId = req.query.id_medical_center ? parseInt(req.query.id_medical_center, 10) : undefined;
            const data = await dashboardService.getMetrics(centerId);
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
