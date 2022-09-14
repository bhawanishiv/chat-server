import cors from 'cors';
import session from 'express-session';
import connectMongoSession from 'connect-mongodb-session';
import morgan from 'morgan';

import { myStream } from 'app/services/logger';
import { getMongoConnectUri } from 'app/lib/utils';

const core = (app) =>
  new Promise((resolve, reject) => {
    const oneDay = 1000 * 60 * 60 * 24;

    const sessionParams = {
      secret: process.env.APP_SESSION_KEY,
      saveUninitialized: true,
      cookie: { maxAge: oneDay },
      resave: false,
    };

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
      })
    );

    if (process.env.NODE_ENV === 'production') {
      app.set('trust proxy', 1); // trust first proxy
      sessionParams.cookie.secure = true; // serve secure cookies
    }

    const MongoDBStore = connectMongoSession(session, (e) => {
      reject(e);
    });

    const store = new MongoDBStore({
      uri: getMongoConnectUri(),
      collection: process.env.APP_SESSION_STORAGE_KEY,
    });

    app.use(session({ ...sessionParams, store }));

    if (process.env.NODE_ENV !== 'production') {
      app.use(morgan('dev', { stream: myStream }));
    }

    resolve();
  });

export default core;
