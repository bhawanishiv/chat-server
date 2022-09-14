import { Router } from 'express';

import groupsV1Routes from 'app/api/routes/groups/groups.v1.routes';

const router = Router();

router.use('/v1', groupsV1Routes);

export default router;
