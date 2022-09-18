import { Schema, model } from 'mongoose';

export const groupMessageLikeSchema = new Schema(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'GroupMessage',
      required: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'GroupMember',
      unique: true,
      required: true,
    },
    like: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

const GroupMessageLike = model('GroupMessageLike', groupMessageLikeSchema);

export default GroupMessageLike;
