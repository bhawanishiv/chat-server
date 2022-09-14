import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import handler from 'app/api/middlewares/handler';

import Failure from 'app/lib/Failure';
import ERROR_CODES from 'app/lib/error-codes';
import { APP_NAME, TIMES, TOKEN_TYPES } from 'app/lib/constants';

import { getATPrivateKey, getRTPrivateKey } from 'app/lib/utils';

import User from 'app/models/User';

export const authV1Login = [
  handler(async (req, res, next) => {
    const { username, password } = req.body;
    const { session } = req;

    const user = await User.findOne({
      $or: [{ email: username }, { phoneNumber: username }],
    }).exec();

    if (!user)
      throw new Failure('Invalid credentials', ERROR_CODES.INVALID_INPUT);

    const hashCompared = await bcrypt.compare(password, user.hashPswd);

    if (!hashCompared)
      throw new Failure('Invalid credentials', ERROR_CODES.INVALID_INPUT);

    const userResult = {
      uid: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    if (user.phoneNumber) {
      userResult.phoneNumber = user.phoneNumber;
    }

    const refreshToken = jwt.sign(
      { uid: userResult.uid, email: userResult.email },
      getRTPrivateKey(),
      {
        audience: APP_NAME,
        algorithm: 'HS256',
        expiresIn: TIMES.auth.refreshToken,
        subject: userResult.uid,
      }
    );

    const accessToken = jwt.sign(
      { uid: userResult.uid, email: userResult.email },
      getATPrivateKey(),

      {
        audience: APP_NAME,
        algorithm: 'HS256',
        expiresIn: TIMES.auth.refreshToken,
        subject: userResult.uid,
      }
    );

    const response = {
      user: userResult,
      refreshToken,
      accessToken,
      tokenType: TOKEN_TYPES.bearer,
    };

    session.rt = refreshToken;
    res.json(response);
  }),
];

export const authV1Logout = [
  handler(async (req, res) => {
    if (!req.session.rt) {
      throw new Failure('Invalid session', ERROR_CODES.INVALID_INPUT);
    }

    req.session.destroy();
    res.json({ logout: true });
  }),
];
