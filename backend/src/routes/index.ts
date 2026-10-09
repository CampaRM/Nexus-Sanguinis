import { Router } from 'express';
import authRoutes from './auth.routes';
import medicalCenterRoutes from './medicalCenter.routes';
import bloodUnitRoutes from './bloodUnit.routes';
import transferRequestRoutes from './transferRequest.routes';
import dashboardRoutes from './dashboard.routes';
import movementHistoryRoutes from './movementHistory.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/medical-centers', medicalCenterRoutes);
router.use('/blood-units', bloodUnitRoutes);
router.use('/transfers', transferRequestRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/movements', movementHistoryRoutes);

export default router;
