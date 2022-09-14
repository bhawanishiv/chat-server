import { Router } from 'express';

import usersV1Routes from 'app/api/routes/users/v1';

const router = Router();

router.use('/v1', usersV1Routes);

export default router;
