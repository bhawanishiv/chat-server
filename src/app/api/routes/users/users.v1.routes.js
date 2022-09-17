import { body } from 'express-validator';
import { Router } from 'express';

import validate from 'app/api/middlewares/validate';

import { usersV1Search } from 'app/api/controllers/users/users.v1.controllers';

const router = Router();

router.post(
  '/search',
  validate([
    body('keyword').isString().isLength({ min: 3, max: 100 }),
    body('limit').isNumeric(),
    body('skip').isNumeric(),
    body('sort').optional().isObject(),
  ]),
  usersV1Search
);

export default router;
