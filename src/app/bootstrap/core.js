import cors from 'cors';
import morgan from 'morgan';

import { myStream } from 'app/services/logger';

const core = (app) => {
  app.use(
    cors({
      origin: true,
      // origin: ['http://localhost:3000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'cache-control',
        'credentials',
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev', { stream: myStream }));
  }
};

export default core;
