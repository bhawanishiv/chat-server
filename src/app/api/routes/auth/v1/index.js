import { body } from 'express-validator';
import { Router } from 'express';

import validate from 'app/api/middlewares/validate';

import { REGEX, STR_LENGTHS } from 'app/lib/constants';

import { authV1SignIn } from 'app/api/controllers/auth/v1';

const router = Router();

router.post(
  '/login',
  validate([
    // sign in body params
    body('username').notEmpty(),
    body('password').notEmpty(),
  ]),
  authV1SignIn
);

router.post(
  '/logout'

  // authV1SignUp
);

export default router;
