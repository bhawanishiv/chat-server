import winston from 'winston';

const alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: '[LOGGER]',
  }),
  winston.format.timestamp({
    format: 'DD-MM-YY HH:MM:SS',
  }),
  winston.format.printf(
    (info) =>
      `${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);

const logger = winston.createLogger({
  transports: [],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        alignColorsAndTime
      ),
    })
  );
}

export const myStream = {
  write: (text) => {
    logger.info(text);
  },
};

export default logger;
