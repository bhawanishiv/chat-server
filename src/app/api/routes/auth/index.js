import { Router } from 'express';

import authV1Routes from 'app/api/routes/auth/v1';

const router = Router();

router.use('/v1', authV1Routes);

export default router;
