export const getRTPrivateKey = () => process.env.AUTH_V1_RT_KEY;

export const getATPrivateKey = () => process.env.AUTH_V1_AT_KEY;

export const getMongoConnectUri = () => {
  if (process.env.NODE_ENV === 'production') {
    return `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_SERVER}/${process.env.MONGO_DB_DATABASE_NAME}?retryWrites=true&w=majority`;
  }
  return `mongodb://${process.env.MONGO_DB_SERVER}/${process.env.MONGO_DB_DATABASE_NAME}`;
};
