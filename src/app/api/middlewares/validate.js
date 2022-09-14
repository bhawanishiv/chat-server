import { validationResult } from 'express-validator';

import ERROR_CODES from 'app/lib/error-codes';
import Failure from 'app/lib/Failure';
import logger from 'app/services/logger';

// eslint-disable-next-line consistent-return
const validate = (validations) => async (req, res, next) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const validation of validations) {
    // eslint-disable-next-line no-await-in-loop
    const result = await validation.run(req);
    if (result.errors.length) break;
  }

  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const _errors = errors.array({ onlyFirstError: true });
  logger.error(_errors);
  const { param } = _errors[0];
  const options = { param };
  next(new Failure(_errors[0].msg, ERROR_CODES.INVALID_INPUT, options));
};

export default validate;
