import { Router } from 'express';

import { getUserV1Info } from 'app/api/controllers/users/v1';

const router = Router();

router.post('/userinfo', getUserV1Info);

// router.post('/mock', async (req, res) => {
//   setTimeout(() => {
//     res.json([{ name: 'Some name' }]);
//   }, 16000);
// });

export default router;
