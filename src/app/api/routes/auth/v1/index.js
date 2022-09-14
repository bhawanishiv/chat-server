import { body } from 'express-validator';
import { Router } from 'express';

import validate from 'app/api/middlewares/validate';

import { authV1Login, authV1Logout } from 'app/api/controllers/auth/v1';

const router = Router();

router.post(
  '/login',
  validate([
    // sign in body params
    body('username').notEmpty(),
    body('password').notEmpty(),
  ]),
  authV1Login
);

router.post('/logout', authV1Logout);

export default router;
