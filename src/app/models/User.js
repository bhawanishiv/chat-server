import { Schema, model } from 'mongoose';

export const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    hashPswd: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'USER',
      required: true,
    },
  },
  { timestamps: true }
);

const User = model('User', userSchema);

export default User;
