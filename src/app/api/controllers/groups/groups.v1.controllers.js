import { isValidObjectId } from 'mongoose';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import handler from 'app/api/middlewares/handler';

import Failure from 'app/lib/Failure';
import ERROR_CODES from 'app/lib/error-codes';

import User from 'app/models/User';
import Group from 'app/models/Group';

import { checkToken, getUser } from 'app/api/middlewares/auth';
import GroupMember from 'app/models/GroupMember';
import { getGroup } from 'app/api/middlewares/groups';
import { async } from '@babel/runtime/helpers/regeneratorRuntime';

export const groupV1Create = [
  handler(checkToken),
  handler(getUser((req) => req.decodedAccessToken.uid, 'user')),
  handler(async (req, res, next) => {
    if (!req.user) throw new Failure('Invalid user', ERROR_CODES.NOT_FOUND);
    next();
  }),
  handler(async (req, res, next) => {
    const { user } = req;

    const { name } = req.body;
    const _name = name.trim();

    const existingGroup = await Group.findOne({
      $and: [{ createdBy: user.uid }, { name: _name }],
    }).exec();

    if (existingGroup) {
      throw new Failure(
        'You already have group created with the same name',
        ERROR_CODES.CONFLICTS
      );
    }

    const group = new Group({ name, createdBy: user.uid });
    await group.save();

    // Add group owner to the group as group member
    const groupCreator = new GroupMember({
      groupId: group._id,
      userId: user.uid,
      addedBy: user.uid,
    });

    await groupCreator.save();

    const payload = {
      group: {
        id: group._id.toString(),
        ..._.pick(group.toJSON(), 'name', 'createdAt', 'updatedAt'),
        createdBy: user,
      },
    };

    res.json(payload);
  }),
];

export const groupV1Remove = [
  handler(async (req, res, next) => {
    const { groupId } = req.params;
    if (!isValidObjectId(groupId))
      throw new Failure('Invalid groupId provided', ERROR_CODES.INVALID_INPUT);
    next();
  }),
  handler(checkToken),
  handler(getUser((req) => req.decodedAccessToken.uid, 'user')),
  handler(async (req, res, next) => {
    if (!req.user) throw new Failure('Invalid user', ERROR_CODES.NOT_FOUND);

    next();
  }),
  handler(getGroup((req) => req.params.groupId, 'group')),
  handler(async (req, res, next) => {
    const { group, user } = req;

    if (!group) throw new Failure('Invalid group', ERROR_CODES.INVALID_INPUT);

    if (group.createdBy.uid !== user.uid)
      throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);

    const deletedGroup = await Group.findByIdAndRemove(group.groupId).exec();

    if (!deletedGroup)
      throw new Failure('Unable to remove the group', ERROR_CODES.SERVER_ERROR);

    const payload = {
      group,
    };

    res.json(payload);
  }),
];

export const groupV1MemberAdd = [
  handler(checkToken),
  handler(getUser((req) => req.decodedAccessToken.uid, 'user')),
  handler(async (req, res, next) => {
    if (!req.user) throw new Failure('Invalid user', ERROR_CODES.NOT_FOUND);
    next();
  }),
  handler(async (req, res, next) => {
    const { groupId, userId } = req.params;
  }),
];

export const groupV1MemberRemove = [
  handler(async (req, res) => {
    if (!req.session.rt) {
      throw new Failure('Invalid session', ERROR_CODES.INVALID_INPUT);
    }

    req.session.destroy();
    res.json({ logout: true });
  }),
];
