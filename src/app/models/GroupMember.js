import { Schema, model } from 'mongoose';

export const groupMemberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      default: 'ACTIVE', // Can be one of ACTIVE, REMOVED
      required: true,
    },
  },
  { timestamps: true }
);

const GroupMember = model('GroupMember', groupMemberSchema);

export default GroupMember;
