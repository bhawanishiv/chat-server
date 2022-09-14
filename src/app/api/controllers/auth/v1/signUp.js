import bcrypt from 'bcrypt';

import handler from 'app/api/middlewares/handler';

import {
  APP_ACCESS_TOKEN_KEY,
  APP_ID_TOKEN_KEY,
  APP_REFRESH_TOKEN_KEY,
  AUTH_KEYS,
  COOKIE_KEY,
  DOMAIN_NAME,
  OAUTH_SCOPE_ALIASES,
  PROTOCOL,
  PSWD_HASH_ROUNDS,
  TIMES,
} from 'app/lib/constants';
import {
  Failure,
  ERROR_CODES,
  jwtSign,
  generateAccessToken,
  encrypt,
  base64UrlEncodeWithSHA256,
} from 'app/lib/utilities';

import AuthRole from 'app/models/AuthRole';
import User from 'app/models/User';
import Email from 'app/models/Email';
import Phone from 'app/models/Phone';
import Password from 'app/models/Password';
import Country from 'app/models/Country';

const checkExistingUser = async (req, res, next) => {
  const { email, phoneNumber, countryPhoneCode = 91 } = req.body;
  let country;
  if (phoneNumber && countryPhoneCode) {
    country = await Country.findOne({
      countryCallingCode: countryPhoneCode.toString(),
    }).exec();
    if (!country) {
      throw new Failure(
        'Invalid country phone code',
        ERROR_CODES.INVALID_INPUT
      );
    }
    req.country = country;
  }

  const emailResult = await Email.findOne({ email }).exec();
  if (emailResult) {
    throw new Failure('The email is already registered', ERROR_CODES.CONFLICTS);
  }
  const phoneResult = await Phone.findOne({ phoneNumber }).exec();
  if (phoneResult) {
    throw new Failure('The phone is already registered', ERROR_CODES.CONFLICTS);
  }
  next();
};

const createUser = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    countryPhoneCode = 91,
    password,
  } = req.body;

  let username = `${firstName}.${lastName}`
    .toLowerCase()
    .trim()
    .replace(/ /g, '.');

  const roleResult = await AuthRole.findOne({ role: 'user' }).exec();

  const usernameCount = await User.countDocuments({ username }).exec();
  if (usernameCount) username = `${username}.${usernameCount + 1}`;

  const doorPass = await bcrypt.hash(password, PSWD_HASH_ROUNDS);

  const createdUser = new User({
    firstName,
    lastName,
    username,
    roleId: roleResult.id,
  });
  const uid = createdUser._id;

  const createdPassword = new Password({ doorPass, uid });
  const createdEmail = new Email({ email, uid });

  let createdPhone;
  if (phoneNumber && countryPhoneCode) {
    createdPhone = new Phone({ phoneNumber, countryId: req.country.id, uid });
  }

  await Promise.all([
    createdUser.save(),
    createdPassword.save(),
    createdEmail.save(),
  ]);

  if (createdPhone) await createdPhone.save();

  const userResult = {
    email,
    username,
    uid,
    role: roleResult.role,
    firstName,
    lastName,
  };

  if (createdEmail) {
    userResult.email = email;
  }
  if (createdPhone) {
    userResult.phoneNumber = phoneNumber;
    userResult.countryPhoneCode = countryPhoneCode;
  }

  req.userResult = userResult;
  next();
};

/**
 * @method POST
 * @endpoint /auth/v1/signup
 */
const authV1SignUp = [
  handler(checkExistingUser),
  handler(createUser),
  handler(async (req, res, next) => {
    const { userResult } = req;

    const iat = Date.now();
    const issuer = `${PROTOCOL}://${DOMAIN_NAME}`;

    const idTokenPayload = {
      iss: issuer,
      aud: issuer,
      iat,
      exp: iat + TIMES.auth.idToken,
      sub: userResult.uid,
      email: userResult.email,
      firstName: userResult.firstName,
      lastName: userResult.lastName,
    };

    const id_token = jwtSign(idTokenPayload, APP_ID_TOKEN_KEY);

    const access_token = generateAccessToken(
      {
        iss: issuer,
        aud: issuer,
        iat,
        exp: iat + TIMES.auth.idToken,
        scope: OAUTH_SCOPE_ALIASES.openid,
        sub: userResult.uid,
      },
      APP_ACCESS_TOKEN_KEY
    );

    const expires = iat + TIMES.auth.refreshToken;

    const refreshToken = encrypt(
      {
        iss: issuer,
        aud: issuer,
        iat,
        exp: expires,
        sub: userResult.uid,
      },
      APP_REFRESH_TOKEN_KEY
    );

    res.cookie(
      base64UrlEncodeWithSHA256(
        { [AUTH_KEYS.refreshToken]: DOMAIN_NAME },
        COOKIE_KEY
      ),
      refreshToken,
      {
        httpOnly: process.env.NODE_ENV === 'development',
        expires: new Date(expires),
        domain: `.${DOMAIN_NAME}`,
      }
    );

    const response = {
      id_token,
      access_token,
      token_type: AUTH_KEYS.bearer,
      expires_in: Math.floor(TIMES.auth.accessToken / 1000),
    };

    res.json(response);
  }),
];

export default authV1SignUp;
