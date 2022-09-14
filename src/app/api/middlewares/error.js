import logger from 'app/services/logger';

const errorMiddleware = (error, req, res, next) => {
  const {
    code = 500, message, options, stack,
  } = error;
  const response = { error: { message, ...options } };
  logger.error({ ...response, stack });
  res.status(code).json(response);
};

export default errorMiddleware;
