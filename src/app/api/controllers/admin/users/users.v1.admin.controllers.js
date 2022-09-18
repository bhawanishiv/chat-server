/* eslint-disable no-restricted-syntax */
import { isValidObjectId } from 'mongoose';
import bcrypt from 'bcrypt';

import handler from 'app/api/middlewares/handler';

import { PSWD_HASH_ROUNDS } from 'app/lib/constants';
import ERROR_CODES from 'app/lib/error-codes';
import Failure from 'app/lib/Failure';

import User from 'app/models/User';
import { checkToken, getUser } from 'app/api/middlewares/auth';
import { checkRole } from 'app/api/middlewares/role';

const initUsers = async (users) => {
  for (const user of users) {
    const { password, ...restParams } = user;

    // eslint-disable-next-line no-await-in-loop
    const hashedPswd = await bcrypt.hash(password, PSWD_HASH_ROUNDS);

    const newUser = new User({ ...restParams, hashPswd: hashedPswd });
    console.log(newUser);
    // eslint-disable-next-line no-await-in-loop
    await newUser.save();
  }
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
    role: 'ADMIN',
  },
  {
    email: 'admin@gmail.com',
    firstName: 'Admin',
    lastName: 'User',
    password: 'Text@#$f3',
  },
];

// initUsers(users);

export const adminV1CreateUser = [
  handler(checkToken),
  handler(getUser((req) => req.decodedAccessToken.uid, 'user')),
  handler(async (req, res, next) => {
    if (!req.user) throw new Failure('Invalid user', ERROR_CODES.NOT_FOUND);
    next();
  }),
  handler(checkRole('ADMIN', 'user')),
  handler(async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    }).exec();

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Failure('Email already exists', ERROR_CODES.INVALID_INPUT, {
          param: 'email',
        });
      }
      if (phoneNumber) {
        throw new Failure(
          'Phone number already exists',
          ERROR_CODES.INVALID_INPUT,
          { param: 'phoneNumber' }
        );
      }
    }

    const hashedPswd = await bcrypt.hash(password, PSWD_HASH_ROUNDS);

    const params = {
      firstName,
      lastName,
      email,
    };

    if (phoneNumber) {
      params.phoneNumber = phoneNumber;
    }

    const user = new User({ ...params, hashPswd: hashedPswd });
    await user.save();

    const createdUser = { uid: user._id.toString(), ...params };
    console.log(`createdUser->`, createdUser);
    res.json({ user: createdUser });
  }),
];

export const adminV1UpdateUser = [
  handler(checkToken),
  handler(getUser((req) => req.decodedAccessToken.uid, 'user')),
  handler(async (req, res, next) => {
    if (!req.user) throw new Failure('Invalid user', ERROR_CODES.NOT_FOUND);
    next();
  }),
  handler(checkRole('ADMIN', 'user')),
  handler(async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, uid, role } =
      req.body;

    const hashedPswd = await bcrypt.hash(password, PSWD_HASH_ROUNDS);

    if (!isValidObjectId(uid))
      throw new Failure('Invalid user to update', ERROR_CODES.INVALID_INPUT);

    const duplicateEmailUser = await User.findOne({
      email,
    }).exec();

    if (duplicateEmailUser && duplicateEmailUser._id.toString() !== uid) {
      throw new Failure('Email already exists', ERROR_CODES.INVALID_INPUT);
    }

    if (phoneNumber) {
      const duplicatePhoneUser = await User.findOne({
        phoneNumber,
      }).exec();

      if (duplicatePhoneUser && duplicatePhoneUser._id.toString() !== uid) {
        throw new Failure(
          'Phone number already exists',
          ERROR_CODES.INVALID_INPUT
        );
      }
    }

    const params = {
      firstName,
      lastName,
      email,
      hashPswd: hashedPswd,
      role,
    };

    if (phoneNumber) {
      params.phoneNumber = phoneNumber;
    }

    const updatedUser = await User.findByIdAndUpdate(uid, params, {
      returnDocument: 'after',
    }).exec();

    if (!updatedUser)
      throw new Failure('Invalid update user', ERROR_CODES.INVALID_INPUT);

    const userResult = {
      uid: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    if (updatedUser.phoneNumber) {
      userResult.phoneNumber = updatedUser.phoneNumber;
    }

    res.json({ user: userResult });
  }),
];
