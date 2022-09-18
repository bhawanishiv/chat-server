import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  colors,
} from 'unique-names-generator';

import { io as Client } from 'socket.io-client';

import supertest from 'supertest';
import { expect } from 'chai';
import { before } from 'mocha';

const userAgent = supertest.agent('http://localhost:8000');
const anotherUserAgent = supertest.agent('http://localhost:8000');

const USER_1_CREDS = { username: 'user@gmail.com', password: 'Te3Vec3@#$f3' };
const USER_2_CREDS = { username: 'admin@gmail.com', password: 'Text@#$f3' };

const generateName = (params = {}) =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, animals, colors],
    ...params,
  });

describe('Group messages', () => {
  let clientSocket1;
  let clientSocket2;
  let signInUser;
  let anotherSignInUser;
  let createdGroup;

  before(async () => {
    const userRes = await userAgent.post('/auth/v1/login').send(USER_1_CREDS);
    signInUser = userRes.body;
    userAgent.set(
      'Authorization',
      `${signInUser.tokenType} ${signInUser.accessToken}`
    );

    clientSocket1 = new Client('http://localhost:8000', {
      extraHeaders: {
        Authorization: `${signInUser.tokenType} ${signInUser.accessToken}`,
      },
    });
  });

  before(async () => {
    const res = await userAgent.post('/groups/v1/create').send({
      name: generateName({ name: 20 }),
    });

    createdGroup = res.body.group;

    clientSocket1.emit('join-group', `group:${createdGroup.groupId}`);
  });

  before(async () => {
    const userRes = await anotherUserAgent
      .post('/auth/v1/login')
      .send(USER_2_CREDS);

    anotherSignInUser = userRes.body;

    anotherUserAgent.set(
      'Authorization',
      `${anotherSignInUser.tokenType} ${anotherSignInUser.accessToken}`
    );

    clientSocket2 = new Client('http://localhost:8000', {
      extraHeaders: {
        Authorization: `${anotherSignInUser.tokenType} ${anotherSignInUser.accessToken}`,
      },
    });

    clientSocket2.emit('join-group', `group:${createdGroup.groupId}`);
  });

  describe('Send message in a group', async () => {
    it('should send a message successfully', () => {
      clientSocket1.on('group-message', (data) => {
        expect(data).to.be.an('object');
        expect(data._id).to.be.a('string');
        expect(data.message).to.be.a('string');
      });
      const data = {
        groupId: createdGroup.groupId,
        message: generateName(),
      };
      clientSocket1.emit('group-message', data);
    });
  });

  describe('Like a message in a group', async () => {
    it('Should like a message successfully', () => {
      clientSocket1.on('group-update', (data) => {
        expect(data).to.be.an('object');
        expect(data.type).to.be.equal('like');
        expect(data.data).to.be.a('object');
      });

      clientSocket1.on('group-message', (_data) => {
        const data = {
          messageId: _data._id,
          like: true,
        };
        clientSocket1.emit('group-like-message', data);
      });

      clientSocket1.emit('group-message', {
        groupId: createdGroup.groupId,
        message: generateName(),
      });
    });
  });

  after(() => {
    clientSocket1.close();
    clientSocket2.close();
  });
});
