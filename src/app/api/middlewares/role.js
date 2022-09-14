import ERROR_CODES from 'app/lib/error-codes';
import Failure from 'app/lib/Failure';

export const checkRole =
  (role, key = 'user') =>
  (req, res, next) => {
    const user = req[key];
    if (user.role !== role)
      throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);

    next();
  };
