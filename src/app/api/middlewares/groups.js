import _ from 'lodash';

import Group from 'app/models/Group';
import GroupMember from 'app/models/GroupMember';
import { getUserData } from 'app/lib/utils';

export const getGroup =
  (cb, key = 'group') =>
  async (req, res, next) => {
    const groupId = await cb(req, res, next);

    const group = await Group.findById(groupId).populate('createdBy').exec();

    let groupResult;

    if (group) {
      const data = _.pick(
        group.toJSON(),
        'createdBy',
        'createdAt',
        'updatedAt',
        'name'
      );

      groupResult = {
        groupId: group._id.toString(),
        ...data,
        createdBy: getUserData(data.createdBy),
      };
    }

    req[key] = groupResult;

    next();
  };

export const getGroupMember =
  (cb, key = 'groupMember') =>
  async (req, res, next) => {
    const memberId = await cb(req, res, next);
    const groupMember = await GroupMember.findById(memberId)
      .populate('userId')
      .populate('groupId')
      .populate('addedBy')
      .exec();

    let groupMemberResult;

    if (groupMember) {
      const data = _.pick(
        groupMember.toJSON(),
        'status',
        'createdAt',
        'updatedAt'
      );

      groupMemberResult = {
        memberId: groupMember._id.toString(),
        ...data,
        user: getUserData(groupMember.userId),
        group: groupMember.groupId,
        addedBy: getUserData(groupMember.addedBy),
      };
    }

    req[key] = groupMemberResult;

    next();
  };
