import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from 'unique-names-generator';

import supertest from 'supertest';
import { expect } from 'chai';
import { before } from 'mocha';

const userAgent = supertest.agent('http://localhost:8000');
const anotherUserAgent = supertest.agent('http://localhost:8000');

const USER_CREDS = { username: 'user@gmail.com', password: 'Te3Vec3@#$f3' };

const ANOTHER_USER_CREDS = {
  username: 'admin@gmail.com',
  password: 'Text@#$f3',
};

const generateName = (params = {}) =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    ...params,
  });

describe('Group Members', () => {
  const groupName = generateName();
  let signInUser;
  let createdGroup;

  before(async () => {
    const userRes = await userAgent.post('/auth/v1/login').send(USER_CREDS);
    signInUser = userRes.body;

    userAgent.set(
      'Authorization',
      `${signInUser.tokenType} ${signInUser.accessToken}`
    );

    const res = await userAgent
      .post('/groups/v1/create')
      .send({
        name: groupName,
      })
      .expect(200);

    expect(res.body.group).to.be.an('object');
    expect(res.body.group.groupId).to.be.an('string');
    expect(res.body.group.createdBy).to.be.an('string');

    createdGroup = res.body.group;
  });

  // describe('Search a member', async () => {});

  // describe('Add a member', async () => {});

  // describe('Delete a member', async () => {});
});
