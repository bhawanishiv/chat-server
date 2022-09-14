import bodyParser from 'body-parser';

import apiRoutes from 'app/api/routes';

const routes = (app) => {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(apiRoutes);
};

export default routes;
