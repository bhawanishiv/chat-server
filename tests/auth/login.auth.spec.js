import supertest from 'supertest';
import { expect } from 'chai';

const request = supertest('http://localhost:8000');

const USERS = {
  admin: { username: 'admin@gmail.com', password: 'Text@#$f3' },
  user: { username: 'user@gmail.com', password: 'Te3Vec3@#$f3' },
};

describe('Login', () => {
  it('Should login successfully', async () => {
    const res = await request
      .post('/auth/v1/login')
      .send(USERS.user)
      .expect(200);

    expect(res.body.user).to.be.an('object');
    expect(res.body.accessToken).to.be.a('string');
    expect(res.body.refreshToken).to.be.a('string');
  });

  it('Should fail to login, email not provided', async () => {
    await request
      .post('/auth/v1/login')
      .send({ password: USERS.user.password })
      .expect(400);
  });

  it('Should fail to login, password not provided', async () => {
    await request.post('/auth/v1/login').expect(400);
  });

  it("Should fail to login, email does'nt exist", async () => {
    await request
      .post('/auth/v1/login')
      .send({ username: 'me@gmail.com', password: USERS.user.password })
      .expect(400);
  });

  it('Should fail to login, invalid password', async () => {
    await request
      .post('/auth/v1/login')
      .send({ username: USERS.user.username, password: 'sas' })
      .expect(400);
  });
});
