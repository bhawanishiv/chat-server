import { Schema, model } from 'mongoose';

export const groupMessageSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'GroupMember',
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const groupMessage = model('groupMessage', groupMessageSchema);

export default groupMessage;
