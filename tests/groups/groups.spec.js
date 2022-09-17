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

describe('Groups', () => {
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
  });

  describe('Create a group', () => {
    it('Should successfully create a group', async () => {
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

    it('Should fail to create a group, user is already a creator of same group name', async () => {
      await userAgent
        .post('/groups/v1/create')
        .send({
          name: createdGroup.name,
        })
        .expect(409);
    });

    it('Should fail to create a group, name not provided', async () => {
      await userAgent.post('/groups/v1/create').send({}).expect(400);
    });

    it('Should fail to create a group, name max length increased', async () => {
      await userAgent
        .post('/groups/v1/create')
        .send({ name: 'A sentence that has length greater than 25 characters' })
        .expect(400);
    });

    it('Should fail to create a group, name less than min length', async () => {
      await userAgent
        .post('/groups/v1/create')
        .send({ name: 'two' })
        .expect(400);
    });
  });

  describe('Delete an existing group', () => {
    let anotherGroup;

    before(async () => {
      const anotherUserRes = await anotherUserAgent
        .post('/auth/v1/login')
        .send(ANOTHER_USER_CREDS);
      const anotherSignedInUser = anotherUserRes.body;

      anotherUserAgent.set(
        'Authorization',
        `${anotherSignedInUser.tokenType} ${anotherSignedInUser.accessToken}`
      );

      const res = await anotherUserAgent
        .post('/groups/v1/create')
        .send({
          name: generateName(),
        })
        .expect(200);

      expect(res.body.group).to.be.an('object');
      expect(res.body.group.groupId).to.be.an('string');
      expect(res.body.group.createdBy).to.be.an('string');

      anotherGroup = res.body.group;
    });

    it('Should successfully delete a group', async () => {
      const res = await userAgent
        .delete(`/groups/v1/${createdGroup.groupId}`)
        .expect(200);

      expect(res.body.group).to.be.an('object');
      expect(res.body.group.groupId).to.be.an('string');
      expect(res.body.group.createdBy).to.be.an('object');
    });

    it('Should fail to delete a group, deleted groupId provided', async () => {
      await userAgent.delete(`/groups/v1/${createdGroup.groupId}`).expect(400);
    });

    it('Should fail to delete a group, invalid groupId provided', async () => {
      await userAgent.delete(`/groups/v1/sf`).expect(400);
    });

    it("Should fail to delete a group, member doesn't belong to the group", async () => {
      await userAgent.delete(`/groups/v1/${anotherGroup.groupId}`).expect(401);
    });
  });
});
