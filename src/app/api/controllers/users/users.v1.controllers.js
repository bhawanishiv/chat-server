import { isValidObjectId } from 'mongoose';
import _ from 'lodash';

import handler from 'app/api/middlewares/handler';
import { checkToken, getUser } from 'app/api/middlewares/auth';

import Failure from 'app/lib/Failure';
import ERROR_CODES from 'app/lib/error-codes';

import User from 'app/models/User';

export const usersV1Search = [
  handler(checkToken),
  handler(getUser((req) => req.decodedAccessToken.uid, 'user')),
  handler(async (req, res, next) => {
    if (!req.user) throw new Failure('Invalid user', ERROR_CODES.NOT_FOUND);
    next();
  }),
  handler(async (req, res, next) => {
    const { keyword, limit, skip, sort } = req.body;
    const regex = new RegExp(keyword, 'i');

    const filter = {
      $or: [
        {
          firstName: regex,
        },
        {
          lastName: regex,
        },
        {
          email: regex,
        },
        {
          phoneNumber: regex,
        },
      ],
    };

    const users = await User.aggregate([
      { $match: filter },
      {
        $project: {
          uid: '$_id',
          _id: 0,
          email: 1,
          phoneNumber: 1,
          firstName: 1,
          lastName: 1,
          role: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
          ...sort,
        },
      },
      { $limit: limit },
      { $skip: skip },
    ]);

    const countRes = await User.aggregate([
      { $match: filter },
      {
        $sort: {
          createdAt: -1,
          ...sort,
        },
      },
      { $count: 'count' },
    ]);

    res.json({ users, count: countRes[0] ? countRes[0].count : 0 });
  }),
];
