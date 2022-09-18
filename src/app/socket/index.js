import {
  groupMessageSocket,
  joinGroupSocket,
  likeMessageSocket,
} from 'app/socket/messages/messages.socket';

const socketListener = (io, socket) => {
  socket.on('group-message', ...groupMessageSocket(io, socket));
  socket.on('group-like-message', ...likeMessageSocket(io, socket));
  socket.on('join-group', ...joinGroupSocket(io, socket));
};

export default socketListener;
