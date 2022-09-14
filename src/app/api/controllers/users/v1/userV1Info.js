import handler from 'app/api/middlewares/handler';

import { verifyOAuth2V1Token } from 'app/api/middlewares/oAuth2v1';
import { findUser, getUserInfo } from 'app/api/middlewares/user';

import { OAUTH2V1_SCOPES } from 'app/lib/constants';
import { ERROR_CODES, Failure } from 'app/lib/utilities';

/**
 * @method POST
 * @endpoint /user/v1/userinfo
 */
const getUserV1Info = [
  handler(verifyOAuth2V1Token),
  handler(async (req, res, next) => {
    const { decodedToken } = req;
    const { scope, sub } = decodedToken;
    if (scope !== OAUTH2V1_SCOPES.openid) {
      throw new Failure('Invalid request', ERROR_CODES.INVALID_INPUT);
    }
    req.uid = sub;
    next();
  }),
  handler(
    findUser({
      request: 'uid',
      field: 'userResult',
      response: 'user',
      skip: false,
    })
  ),
  handler(getUserInfo),
  handler(async (req, res, next) => {
    const { userInfo } = req;
    res.json(userInfo);
  }),
];

export default getUserV1Info;
