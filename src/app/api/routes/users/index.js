import { Router } from 'express';

import usersV1Routes from 'app/api/routes/users/users.v1.routes';

const router = Router();

router.use('/v1', usersV1Routes);

export default router;
