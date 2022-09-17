import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from 'unique-names-generator';

import supertest from 'supertest';
import { expect } from 'chai';
import { before } from 'mocha';

const userAgent = supertest.agent('http://localhost:8000');
const adminAgent = supertest.agent('http://localhost:8000');

const generateName = () =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
  });

const USER_CREDS = { username: 'user@gmail.com', password: 'Te3Vec3@#$f3' };
const ADMIN_CREDS = { username: 'admin@gmail.com', password: 'Text@#$f3' };

const NEW_USER = { firstName: 'New', lastName: 'User' };

const EXISTING_EMAIL = 'user@gmail.com';
const EXISTING_PHONE = '9876543210';

describe('Admin', () => {
  describe('Normal user', () => {
    let signInUser;

    const username = generateName();

    const body = {
      email: `${username}@gmail.com`,
      password: 'dfg@#$fw3',
      firstName: username.toLocaleUpperCase(),
      lastName: generateName(),
    };

    before(async () => {
      const userRes = await userAgent.post('/auth/v1/login').send(USER_CREDS);
      signInUser = userRes.body;
    });
    describe('Create a user', () => {
      it('Should fail to access create user API', async () => {
        await userAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/create')
          .send(body)
          .expect(401);
      });
    });

    describe('Update an existing user', () => {
      it('Should fail to access update user API', async () => {
        await userAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/update')
          .send({ uid: 'sf23dfs23r2323ef2', ...body })
          .expect(401);
      });
    });
  });

  describe('Admin user', () => {
    let signInUser;
    let createdUser;

    const username = generateName();

    const body = {
      email: `${username}@gmail.com`,
      password: 'dfg@#$fw3',
      firstName: username.toLocaleUpperCase(),
      lastName: generateName(),
    };

    before(async () => {
      const userRes = await adminAgent.post('/auth/v1/login').send(ADMIN_CREDS);

      signInUser = userRes.body;
    });

    describe('Create a user', () => {
      it('Should successfully create a new user', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/create')
          .send(body)
          .expect(200);

        expect(res.body).to.be.an('object');
        expect(res.body.user).to.be.an('object');
        expect(res.body.user.email).to.be.equal(body.email);

        createdUser = res.body.user;
      });

      it('Should fail create a new user, email not provided', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/create')
          .send({ ...NEW_USER })
          .expect(400);
      });

      it('Should fail create a new user, password not provided', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/create')
          .send({ email: `${generateName()}@gmail.com`, ...NEW_USER })
          .expect(400);
      });

      it('Should fail create a new user, empty or firstName not provided', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/create')
          .send({
            email: `${generateName()}@gmail.com`,
            ...NEW_USER,
            firstName: '',
          })
          .expect(400);
      });

      it('Should fail create a new user, empty or lastName not provided', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/create')
          .send({
            email: `${generateName()}@gmail.com`,
            ...NEW_USER,
            lastName: '',
          })
          .expect(400);
      });

      it('Should fail to create a new user, email exists', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/create')
          .send({ email: EXISTING_EMAIL, ...NEW_USER })
          .expect(400);
      });

      it('Should fail to create a new user, phoneNumber exists', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/create')
          .send({
            email: `${username}@gmail.com`,
            ...NEW_USER,
            phoneNumber: EXISTING_PHONE,
            password: 'DVe43G3f23F$',
          })
          .expect(400);
      });
    });

    describe('Update an existing user', () => {
      it('Should successfully update an existing user', async () => {
        const updateUser = {
          uid: createdUser.uid,
          firstName: generateName(),
          lastName: generateName(),
          email: `${username}@gmail.com`,
          password: 'dfg@#$fw3',
        };
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/update')
          .send(updateUser)
          .expect(200);

        expect(res.body).to.be.an('object');
        expect(res.body.user).to.be.an('object');
        expect(res.body.user.email).to.be.equal(updateUser.email);
      });

      it('Should fail to update an existing user, email exists', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/update')
          .send({
            uid: createdUser.uid,
            firstName: generateName(),
            lastName: generateName(),
            email: EXISTING_EMAIL,
            password: 'dfg@#$fw3',
          })
          .expect(400);

        expect(res.body.user).to.be.equal(undefined);
      });

      it('Should fail to update an existing user, phoneNumber exists', async () => {
        const res = await adminAgent
          .set(
            'Authorization',
            `${signInUser.tokenType} ${signInUser.accessToken}`
          )
          .post('/admin/users/v1/update')
          .send({
            uid: createdUser.uid,
            firstName: generateName(),
            lastName: generateName(),
            phoneNumber: EXISTING_PHONE,
            password: 'dfg@#$fw3',
          })
          .expect(400);

        expect(res.body.user).to.be.equal(undefined);
      });
    });
  });
});
