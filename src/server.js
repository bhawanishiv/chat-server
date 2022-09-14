import express from 'express';

import bootstrap from 'app/bootstrap';
import logger from 'app/services/logger';

const port = process.env.PORT || 8000;

const app = express();

bootstrap(app)
  .then(() => {
    app.listen({ port }, () => logger.info(`Server is listening on ${port}`));
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });
