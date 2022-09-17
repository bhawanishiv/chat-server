import supertest from 'supertest';
import { expect } from 'chai';

const agent = supertest.agent('http://localhost:8000');

const USERS = {
  admin: { username: 'admin@gmail.com', password: 'Text@#$f3' },
  user: { username: 'user@gmail.com', password: 'Te3Vec3@#$f3' },
};

describe('Logout', () => {
  it('Should logout successfully', async () => {
    await agent.post('/auth/v1/login').send(USERS.user).expect(200);
    const res = await agent.post('/auth/v1/logout').expect(200);
    expect(res.body).to.be.an('object');
    expect(res.body.logout).to.equal(true);
  });

  it('Should fail to logout, invalid session', async () => {
    await agent.post('/auth/v1/logout').expect(400);
  });
});
