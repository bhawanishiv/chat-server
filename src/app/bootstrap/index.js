import core from './core';
// import staticServe from './static';
import REST from './REST';
// import graphql from "./graphql";
import mongodb from './mongodb';

const bootstrap = (app) => {
  core(app);
  // staticServe(app);
  // graphql(app);
  REST(app);
  return mongodb();
};

export default bootstrap;
