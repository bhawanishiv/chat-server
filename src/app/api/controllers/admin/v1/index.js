import bcrypt from 'bcrypt';

import handler from 'app/api/middlewares/handler';

import { PSWD_HASH_ROUNDS } from 'app/lib/constants';

import User from 'app/models/User';

export const createUser = [
  handler(async (req, res) => {
    const hashPswd = await bcrypt.hash('LATAWith97&ME', PSWD_HASH_ROUNDS);
    const adminUser = new User({
      firstName: 'Bhawani',
      lastName: 'Shankar',
      email: 'bhawanishiv@gmail.com',
      phoneNumber: '8877319377',
      hashPswd,
      role: 'ADMIN',
    });
    await adminUser.save();
    res.json(adminUser.toJSON());
  }),
];
