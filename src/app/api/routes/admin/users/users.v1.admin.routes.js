import { body } from 'express-validator';
import { Router } from 'express';

import validate from 'app/api/middlewares/validate';
import { REGEX, STR_LENGTHS } from 'app/lib/constants';

import {
  adminV1CreateUser,
  adminV1UpdateUser,
} from 'app/api/controllers/admin/users/users.v1.admin.controllers';

const router = Router();

router.post(
  '/v1/create',
  validate([
    body('firstName').notEmpty().isString(),
    body('lastName').notEmpty().isString(),
    body('email').notEmpty().isEmail(),
    body('phoneNumber').optional().isMobilePhone('en-IN'),
    body('password')
      .notEmpty()
      .isLength({ min: STR_LENGTHS.password.min })
      .matches(REGEX.specialCharacter),
  ]),
  adminV1CreateUser
);

router.post(
  '/v1/update',
  validate([
    body('uid').notEmpty().isString(),
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('email').optional().isEmail(),
    body('phoneNumber').optional().isMobilePhone('en-IN'),
    body('role').isIn([undefined, 'USER', 'ADMIN']),
    body('password')
      .optional()
      .isLength({ min: STR_LENGTHS.password.min })
      .matches(REGEX.specialCharacter),
  ]),
  adminV1UpdateUser
);

export default router;
