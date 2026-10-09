"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementHistoryController = void 0;
const movementHistory_service_1 = require("../services/movementHistory.service");
const movementHistoryService = new movementHistory_service_1.MovementHistoryService();
class MovementHistoryController {
    async getAll(req, res, next) {
        try {
            const bloodUnitId = req.query.id_blood_unit ? parseInt(req.query.id_blood_unit, 10) : undefined;
            const userId = req.query.id_user ? parseInt(req.query.id_user, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const history = await movementHistoryService.getAll(bloodUnitId, userId, limit);
            res.status(200).json({ success: true, data: history });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MovementHistoryController = MovementHistoryController;
