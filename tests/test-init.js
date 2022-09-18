import * as dotenv from 'dotenv';

import bcrypt from 'bcrypt';
import { connect } from 'mongoose';
import User from 'app/models/User';
import { PSWD_HASH_ROUNDS } from '../src/app/lib/constants';
import { getMongoConnectUri } from '../src/app/lib/utils';

// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const addUser = async (user) => {
  try {
    const { password, ...restParams } = user;

    // eslint-disable-next-line no-await-in-loop
    const hashedPswd = await bcrypt.hash(password, PSWD_HASH_ROUNDS);

    const newUser = new User({ ...restParams, hashPswd: hashedPswd });
    // eslint-disable-next-line no-await-in-loop
    await newUser.save();
  } catch (e) {
    console.log(`e->`, e);
  }
};
const initUsers = async (users) => {
  await connect(getMongoConnectUri());

  await User.collection.drop();
  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    // eslint-disable-next-line no-await-in-loop
    await addUser(user);
  }

  process.exit(0);
};

const users = [
  {
    email: 'user1@gmail.com',
    firstName: 'User 1',
    lastName: 'Group',
    password: 'Te3Vec3@#$f3',
    role: 'ADMIN',
  },
  {
    email: 'user2@gmail.com',
    firstName: 'User 2',
    lastName: 'Group',
    password: 'Te3Vec3@#$f3',
  },
  {
    email: 'user3@gmail.com',
    firstName: 'User 2',
    lastName: 'Group',
    password: 'Te3Vec3@#$f3',
  },
  {
    email: 'user@gmail.com',
    firstName: 'Normal',
    lastName: 'User',
    password: 'Te3Vec3@#$f3',
  },
  {
    email: 'admin@gmail.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'Text@#$f3',
    phoneNumber: '9876543210',
    role: 'ADMIN',
  },
];

initUsers(users);
