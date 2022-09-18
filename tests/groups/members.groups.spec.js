import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  colors,
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
    dictionaries: [adjectives, animals, colors],

    ...params,
  });

const getRandomInt = (max) => Math.floor(Math.random() * max);

describe('Group Members', () => {
  const groupName = generateName({ name: 20 });
  let signInUser;
  let anotherUser;
  let createdGroup;
  let searchResult = [];
  let searchedUser;
  let addedMember;

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

  before(async () => {
    const anotherUserRes = await anotherUserAgent
      .post('/auth/v1/login')
      .send(ANOTHER_USER_CREDS);

    anotherUser = anotherUserRes.body;

    anotherUserAgent.set(
      'Authorization',
      `${anotherUser.tokenType} ${anotherUser.accessToken}`
    );
  });

  describe('Search users', async () => {
    it('Should successfully make search users API call', async () => {
      const res = await userAgent
        .post('/users/v1/search')
        .send({ keyword: 'user', limit: 10, skip: 0 })
        .expect(200);

      expect(res.body.count).to.be.an('number');
      expect(res.body.users).to.be.an('array');

      searchResult = res.body.users;
    });
  });

  describe('Add a member', async () => {
    before(async () => {
      const res = await userAgent
        .post('/users/v1/search')
        .send({ keyword: 'user1', limit: 10, skip: 0 });

      searchResult = res.body.users;
    });

    before(async () => {
      const randomIndex = getRandomInt(searchResult.length - 1);
      searchedUser = searchResult[randomIndex];
    });

    it('Should successfully add a member', async () => {
      const res = await userAgent
        .post(`/groups/v1/${createdGroup.groupId}/members/${searchedUser.uid}`)
        .expect(200);

      expect(res.body.member).to.be.an('object');
      expect(res.body.member.memberId).to.be.an('string');
      expect(res.body.group).to.be.an('object');
      expect(res.body.group.groupId).to.be.equal(createdGroup.groupId);
      expect(res.body.addedBy).to.be.an('object');
      expect(res.body.addedBy.uid).to.be.equal(signInUser.user.uid);

      addedMember = res.body.member;
    });

    it('Should fail to add a member, invalid userId', async () => {
      await userAgent
        .post(`/groups/v1/${createdGroup.groupId}/members/bs`)
        .expect(400);
    });

    it("Should fail to add a member, person adding the user does\tnt belong to the group, thus hasn't access to add someone", async () => {
      await anotherUserAgent
        .post(`/groups/v1/${createdGroup.groupId}/members/${searchedUser.uid}`)
        .expect(401);
    });

    it('Should fail to add a member, user is already added', async () => {
      await userAgent
        .post(`/groups/v1/${createdGroup.groupId}/members/${searchedUser.uid}`)
        .expect(400);
    });
  });

  describe('Delete a member', async () => {
    it('Should fail to remove a member, invalid memberId', async () => {
      await userAgent.delete(`/groups/v1/members/sf`).expect(400);
    });

    it("Should fail to remove a member, user doesn't belong to member's group", async () => {
      const res = await anotherUserAgent
        .delete(`/groups/v1/members/${addedMember.memberId}`)
        .expect(401);
    });

    it('Should successfully remove a member', async () => {
      const res = await userAgent
        .delete(`/groups/v1/members/${addedMember.memberId}`)
        .expect(200);
    });
  });
});
