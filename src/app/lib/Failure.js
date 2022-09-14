/**
 * Class to handle custom errors
 *
 * Examples:
 * ```js
 * const failure = new Failure("Not found", 404);
 *
 * throw new Failure("Not found", 404);
 * ```
 */
class Failure extends Error {
  code;

  options;

  constructor(message, code = 500, options = {}) {
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

export default Failure;
