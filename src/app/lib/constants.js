export const APP_NAME = 'chat-server';

export const PSWD_HASH_ROUNDS = 13;

export const TIMES = {
  auth: {
    accessToken: 1000 * 60 * 15, // 15 minutes
    refreshToken: 1000 * 60 * 60 * 24 * 365, // 365 days
  },
};

export const TOKEN_TYPES = {
  bearer: 'Bearer',
};
