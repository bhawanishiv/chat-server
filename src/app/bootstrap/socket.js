import { Server } from 'socket.io';

import logger from 'app/services/logger';

import socketListener from 'app/socket';

const socketInit = (server) => {
  const io = new Server(server, {
    /* options */
    cors: {
      origin: '*',
    },
    pingInterval: 3000,
  });

  io.on('connection', (socket) => {
    logger.info('New socket connection is made', socket);
    socketListener(io, socket);

    io.emit('message', { message: 'Connected to chat server' });
  });
};
export default socketInit;
