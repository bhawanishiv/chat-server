import { Router } from 'express';

import errorHandler from 'app/api/middlewares/error';

import authRoutes from './auth';
import adminRoutes from './admin';
import groupsRoutes from './groups';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/groups', groupsRoutes);

router.use(errorHandler);

export default router;
