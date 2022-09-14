import { Router } from 'express';

import adminV1Routes from 'app/api/routes/admin/v1';

const router = Router();

router.use('/v1', adminV1Routes);

export default router;
