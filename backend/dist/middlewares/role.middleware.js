"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = void 0;
const requireRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized request.' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden: Requires one of [${roles.join(', ')}] role(s). Current role: ${req.user.role}`,
            });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
