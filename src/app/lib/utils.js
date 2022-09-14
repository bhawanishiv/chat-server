import _ from 'lodash';

export const getRTPrivateKey = () => process.env.AUTH_V1_RT_KEY;

export const getATPrivateKey = () => process.env.AUTH_V1_AT_KEY;

export const getMongoConnectUri = () => {
  if (process.env.NODE_ENV === 'production') {
    return `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_SERVER}/${process.env.MONGO_DB_DATABASE_NAME}?retryWrites=true&w=majority`;
  }
  return `mongodb://${process.env.MONGO_DB_SERVER}/${process.env.MONGO_DB_DATABASE_NAME}`;
};

export const getUserData = (
  user,
  inputs = ['firstName', 'lastName', 'email', 'role', 'phoneNumber']
) => {
  const res = {
    uid: user._id.toString(),
    ..._.pick(user, inputs),
  };

  return res;
};
