import jwt from 'jsonwebtoken';

import { TOKEN_TYPES } from 'app/lib/constants';
import ERROR_CODES from 'app/lib/error-codes';
import Failure from 'app/lib/Failure';

import User from 'app/models/User';

export const checkToken = async (req, res, next) => {
  const header = req.headers.authorization;
  const prefix = `${TOKEN_TYPES.bearer} `;
  if (!header || !header.startsWith(prefix)) {
    throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);
  }
  const token = header.substring(prefix.length, header.length);
  if (!token) {
    throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);
  }
  const decodedAccessToken = jwt.decode(token);
  if (!decodedAccessToken) {
    throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);
  }

  req.decodedAccessToken = decodedAccessToken;
  next();
};

export const getUser =
  (cb, key = 'user') =>
  async (req, res, next) => {
    const uid = await cb(req, res, next);
    const user = await User.findById(uid).exec();

    let userResult;

    if (user) {
      userResult = {
        uid: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      };

      if (user.phoneNumber) {
        userResult.phoneNumber = user.phoneNumber;
      }
    }

    req[key] = userResult;

    next();
  };
