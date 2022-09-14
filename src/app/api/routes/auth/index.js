import { Router } from 'express';

import authV1Routes from 'app/api/routes/auth/auth.v1.routes';

const router = Router();

router.use('/v1', authV1Routes);

export default router;
