import _ from 'lodash';

import GroupMember from 'app/models/GroupMember';
import GroupMessage from 'app/models/GroupMessage';
import GroupMessageLike from 'app/models/GroupMessageLike';

import { checkToken } from 'app/socket/middlewares/auth';

export const joinGroupSocket = (io, socket) => [
  async (listener) => {
    const decodedAccessToken = checkToken(socket);

    if (!decodedAccessToken) {
      return;
    }
    const { uid } = decodedAccessToken;

    console.log('fd', listener);

    const prefix = `group:`;
    const groupId = listener.substring(prefix.length, listener.length);

    const member = await GroupMember.findOne({
      userId: uid,
      groupId,
    }).exec();

    if (!member) {
      return;
    }

    socket.join(`group:${groupId}`);
  },
];

export const groupMessageSocket = (io, socket) => [
  async (listener) => {
    // // console.log(`io->`, io);
    // const { memberId, message } = socket.data;
    // const { decodedAccessToken } = socket.request;

    const decodedAccessToken = checkToken(socket);
    if (!decodedAccessToken) {
      return;
    }

    const { uid } = decodedAccessToken;
    const { groupId, message } = listener;

    if (!groupId || !message) return;

    console.log(`uid->`, uid);

    const member = await GroupMember.findOne({
      userId: uid,
      groupId,
    }).exec();

    if (!member || !member.groupId) {
      return;
    }

    const newGroupMessage = new GroupMessage({
      groupId,
      memberId: member._id.toString(),
      message,
    });

    await newGroupMessage.save();

    const payload = _.pick(
      newGroupMessage.toJSON(),
      '_id',
      'groupId',
      'message',
      'memberId',
      'createAt',
      'updatedAt'
    );

    console.log(`GROUP`, uid, ` group:${groupId}`);

    io.to(`group:${groupId}`).emit('group-message', payload);
  },
];

export const likeMessageSocket = (io, socket) => [
  async (listener) => {
    const decodedAccessToken = checkToken(socket);
    if (!decodedAccessToken) {
      return;
    }

    const { uid } = decodedAccessToken;
    const { messageId, like } = listener;

    const message = await GroupMessage.findById(messageId)
      .populate('memberId')
      .exec();

    if (
      !message ||
      !message.memberId ||
      !message.memberId.userId ||
      uid !== message.memberId.userId.toString()
    )
      return;

    const likeCreated = await GroupMessageLike.findOneAndUpdate(
      { messageId, memberId: message.memberId._id.toString() },
      { like },
      { upsert: true, returnDocument: 'after' }
    ).exec();

    const payload = _.pick(
      likeCreated,
      '_id',
      'like',
      'createdAt',
      'updatedAt'
    );
    io.to(`group:${message.groupId}`).emit('group-update', {
      type: 'like',
      data: payload,
    });
  },
];
