import handler from 'app/api/middlewares/handler';

import { checkUserIdentity } from 'app/api/middlewares/auth';
import { findUser, getUserInfo } from 'app/api/middlewares/user';

/**
 * @method POST
 * @endpoint /auth/v1/identity
 */
const getAuthV1Identity = [
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
  handler(async (req, res, next) => {
    const { userInfo, phoneResult } = req;

    if (phoneResult) {
      return res.json({
        phoneNumber: userInfo.phoneNumber,
        countryPhoneCode: userInfo.countryPhoneCode,
      });
    }
    return res.json({
      email: userInfo.email,
    });
  }),
];

export default getAuthV1Identity;
