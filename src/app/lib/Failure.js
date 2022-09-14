export const ERROR_CODES = {
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICTS: 409,
  SERVER_ERROR: 500,
};

/**
 * Class to handle custom errors
 *
 * Examples:
 * ```js
 * const failure = new Failure(404,"Not found");
 *
 * throw new Failure(404,"Not found");
 * ```
 *
 */
export class Failure extends Error {
  code;

  options;

  constructor(message, code = ERROR_CODES.INVALID_INPUT, options = {}) {
    // Pass arguments (including vendor specific ones) to parent constructor
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Failure);
    }
    this.code = code;
    this.options = options;
    this.name = 'Failure';
  }
}
