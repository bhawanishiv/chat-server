import core from './core';
// import staticServe from './static';
import REST from './REST';
import socket from './socket';
import mongodb from './mongodb';

const bootstrap = (app, server) => {
  core(app);
  // staticServe(app);
  REST(app);
  socket(server);
  return mongodb();
};

export default bootstrap;
