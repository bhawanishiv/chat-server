import { Router } from 'express';

import adminUsersRoutes from 'app/api/routes/admin/users/users.v1.admin.routes';

const router = Router();

router.use('/users', adminUsersRoutes);

export default router;
