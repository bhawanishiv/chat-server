import { body } from 'express-validator';
import { Router } from 'express';

import validate from 'app/api/middlewares/validate';

import {
  groupV1Create,
  groupV1Remove,
  groupV1MemberAdd,
  groupV1MemberRemove,
} from 'app/api/controllers/groups/groups.v1.controllers';

const router = Router();

router.post('/:groupId/members/:userId', groupV1MemberAdd);

router.delete('/:groupId/members/:memberId', groupV1MemberRemove);

router.delete('/:groupId', groupV1Remove);

router.post(
  '/create',
  validate([body('name').isString().isLength({ min: 5, max: 25 })]),
  groupV1Create
);

export default router;
