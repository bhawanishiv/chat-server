import { body } from 'express-validator';
import { Router } from 'express';

import validate from 'app/api/middlewares/validate';

// import { authV1SignIn } from 'app/api/controllers/auth/v1';

const router = Router();

router.post(
  '/users',
  validate([
    // sign in body params
    body('username').notEmpty(),
    body('password').notEmpty(),
  ])
);

export default router;
