import { isValidObjectId } from 'mongoose';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import handler from 'app/api/middlewares/handler';
import { checkToken, getUser } from 'app/api/middlewares/auth';
import {
  getGroup,
  getGroupMemberByUserIdAndGroupId,
} from 'app/api/middlewares/groups';

import Failure from 'app/lib/Failure';
import ERROR_CODES from 'app/lib/error-codes';

import User from 'app/models/User';
import Group from 'app/models/Group';
import GroupMember from 'app/models/GroupMember';

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
      member: {
        memberId: groupCreator._id.toString(),
        ..._.pick(groupCreator.toJSON(), 'createdAt', 'updatedAt'),
      },
      group: {
        groupId: group._id.toString(),
        ..._.pick(
          group.toJSON(),
          'name',
          'createdBy',
          'createdAt',
          'updatedAt'
        ),
      },
      addedBy: user,
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
  handler(async (req, res, next) => {
    const { groupId, userId } = req.params;
    if (!isValidObjectId(groupId))
      throw new Failure('Invalid groupId provided', ERROR_CODES.INVALID_INPUT);

    if (!isValidObjectId(userId))
      throw new Failure('Invalid userId provided', ERROR_CODES.INVALID_INPUT);

    next();
  }),
  handler(checkToken),
  handler(
    getGroupMemberByUserIdAndGroupId(
      (req) => ({
        userId: req.decodedAccessToken.uid,
        groupId: req.params.groupId,
      }),
      'groupMember'
    )
  ),
  handler(async (req, res, next) => {
    const { groupMember } = req;
    if (!groupMember) {
      throw new Failure('Unauthorized access', ERROR_CODES.UNAUTHORIZED);
    }

    if (!groupMember.group) {
      throw new Failure('Invalid group', ERROR_CODES.NOT_FOUND);
    }

    next();
  }),
  handler(getUser((req) => req.params.userId, 'userToAdd')),
  handler(async (req, res, next) => {
    const { groupId, userId } = req.params;
    const { groupMember, userToAdd } = req;

    if (!userToAdd) throw new Failure('Invalid user', ERROR_CODES.NOT_FOUND);

    const duplicateMember = await GroupMember.findOne({
      $and: [{ userId }, { groupId }],
    }).exec();

    if (duplicateMember) {
      throw new Failure(
        'User already is the member of this group',
        ERROR_CODES.INVALID_INPUT
      );
    }

    const newMember = new GroupMember({
      groupId,
      userId,
      addedBy: groupMember.user.uid,
    });

    await newMember.save();

    const payload = {
      member: {
        memberId: newMember._id.toString(),
        ..._.pick(newMember.toJSON(), 'createdAt', 'updatedAt'),
      },
      group: groupMember.group,
      addedBy: groupMember.user,
    };

    res.json(payload);
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
