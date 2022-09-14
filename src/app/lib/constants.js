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

export const REGEX = {
  specialCharacter: /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
  // specialCharacter: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,
  email:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  number: new RegExp('^[0-9]*$'),
};

export const STR_LENGTHS = {
  username: { min: 6, max: 20 },
  password: { min: 6 },
  displayName: { min: 3, max: 30 },
  message: { min: 3, max: 500 },
};
