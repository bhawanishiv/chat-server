import * as dotenv from 'dotenv';

import { createServer } from 'http';

import express from 'express';

import bootstrap from 'app/bootstrap';
import logger from 'app/services/logger';

// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const port = process.env.PORT || 8000;

const app = express();
const httpServer = createServer(app);

bootstrap(app, httpServer)
  .then(() => {
    httpServer.listen(port, () =>
      logger.info(`Server is listening on ${port}`)
    );
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });

export default app;
