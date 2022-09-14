import publicIp from 'public-ip';
import handler from 'app/api/middlewares/handler';

import {
  checkUserCredentials,
  checkUserIdentity,
} from 'app/api/middlewares/auth';
import { findUser, getUserInfo } from 'app/api/middlewares/user';
import { setSession } from 'app/api/middlewares/session';

import ActiveSession from 'app/models/ActiveSession';

import {
  decrypt,
  encrypt,
  getOAuth2V1PrivateSigningKey,
  jwtSign,
} from 'app/lib/utilities';
import {
  DOMAIN_NAME,
  TIMES,
  AUTH_KEYS,
  PROTOCOL,
  //
  OAUTH2_V1_REFRESH_KEY,
} from 'app/lib/constants';

const generateIdToken = async (userInfo, issuer, iat, user) => {
  const idTokenPayload = {
    email: userInfo.email,
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    iss: issuer,
    iat,
    exp: iat + TIMES.auth.idToken,
    sub: user.uid,
  };

  const authV1IdentityKeySet = await getOAuth2V1PrivateSigningKey('identity');
  const idToken = await jwtSign(idTokenPayload, authV1IdentityKeySet);

  return idToken;
};

const generateSessionWithRefreshToken = async ({
  clientIp,
  sub,
  iss,
  iat,
  exp,
  passPhrase,
}) => {
  const clientPublicIp = await publicIp.v4();
  const platform = null;

  const existingActiveSession = await ActiveSession.findOne({
    uid: sub,
    clientIp,
  }).exec();

  console.log('existingActiveSession->', existingActiveSession);

  let refreshToken = '';

  if (existingActiveSession) {
    const { token } = existingActiveSession;
    const decodedRefreshTokenPayload = decrypt(token, passPhrase);
    if (decodedRefreshTokenPayload) {
      refreshToken = token;
    }
  }

  if (!refreshToken) {
    refreshToken = encrypt(
      {
        iss,
        iat,
        exp,
        sub,
      },
      passPhrase
    );
  }

  const session = await ActiveSession.findOneAndUpdate(
    { uid: sub, clientIp },
    {
      clientIp,
      clientPublicIp,
      platform,
      uid: sub,
      token: refreshToken,
    },
    { upsert: true }
  ).exec();

  return { session, refreshToken };
};

const generateOAuth2V1Token = async ({ sid, iss, aud, iat, scope, sub }) => {
  const oAuth2V1AccessKeySet = await getOAuth2V1PrivateSigningKey('access');

  const accessTokenPayload = {
    sid,
    iss,
    aud,
    iat,
    exp: iat + TIMES.auth.accessToken,
    scope,
    sub,
  };

  const accessToken = await jwtSign(accessTokenPayload, oAuth2V1AccessKeySet);

  const tokenType = AUTH_KEYS.bearer;
  const expiresIn = Math.floor(TIMES.auth.accessToken);
  return { accessToken, tokenType, expiresIn };
};

/**
 * @method POST
 * @endpoint /auth/v1/signin
 */
const authV2SignIn = [
  handler(checkUserIdentity),
  handler(async (req, res, next) => {
    const { username } = req.body;
    //
    const { userResult } = req;
    if (!userResult) req.userQuery = { username };
    next();
  }),
  handler(
    findUser({
      request: 'userQuery',
      field: 'userResult',
      response: 'user',
      skip: false,
    })
  ),
  handler(getUserInfo),
  handler(checkUserCredentials),
  handler(async (req, res, next) => {
    const { userInfo, user, clientIp } = req;

    const response = {};

    const iat = Date.now();
    const domain = `${DOMAIN_NAME}`;
    const issuer = `${PROTOCOL}://${DOMAIN_NAME}`;

    response.id_token = await generateIdToken(userInfo, issuer, iat, user);

    const refreshTokenParams = {
      clientIp,
      iat,
      exp: iat + TIMES.auth.refreshToken,
      iss: issuer,
      passPhrase: OAUTH2_V1_REFRESH_KEY,
      sub: user.uid,
    };

    const sessionAndRefreshToken = await generateSessionWithRefreshToken(
      refreshTokenParams
    );

    response.refresh_token = sessionAndRefreshToken.refreshToken;
    // custom implementation
    response.refresh_token_expires = refreshTokenParams.exp;
    const { session } = sessionAndRefreshToken;

    const { accessToken, tokenType, expiresIn } = await generateOAuth2V1Token({
      sid: session?._id,
      iat,
      iss: issuer,
      sub: user.uid,
    });

    response.access_token = accessToken;
    response.token_type = tokenType;
    response.expires = expiresIn;
    req.response = response;

    res.json(response);
  }),
];

export default authV2SignIn;
