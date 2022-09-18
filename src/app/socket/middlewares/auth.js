import jwt from 'jsonwebtoken';

import { TOKEN_TYPES } from 'app/lib/constants';
import ERROR_CODES from 'app/lib/error-codes';
import Failure from 'app/lib/Failure';

import User from 'app/models/User';
import { getUserData } from 'app/lib/utils';

export const checkToken = (socket) => {
  const header = socket.handshake.headers.authorization;
  const prefix = `${TOKEN_TYPES.bearer} `;
  if (!header || !header.startsWith(prefix)) {
    // throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);
    return null;
  }
  const token = header.substring(prefix.length, header.length);
  if (!token) {
    // throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);
    return null;
  }
  const decodedAccessToken = jwt.decode(token);
  if (!decodedAccessToken) {
    // throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);
    return null;
  }
  // eslint-disable-next-line no-param-reassign
  return decodedAccessToken;
};
