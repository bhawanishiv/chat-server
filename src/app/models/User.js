import { Schema, model } from 'mongoose';

export const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthRole',
      required: true,
    },
  },
  { timestamps: true },
);

const User = model('User', userSchema);

export default User;
