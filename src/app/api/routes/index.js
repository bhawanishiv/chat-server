import { Router } from 'express';

import errorHandler from 'app/api/middlewares/error';

import clientRoutes from './client';
import oAuth2Routes from './oAuth2';
import authRoutes from './auth';
import usersRoutes from './users';

const router = Router();

router.use('/clients', clientRoutes);
router.use('/oauth2', oAuth2Routes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

router.use(errorHandler);

export default router;
