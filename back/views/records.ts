import { body, param, query } from 'express-validator';
import { Op } from 'sequelize';

import { router } from '.';
import { HTTPStatusError } from '../error';
import { User, Record } from '../models';
import { decodeToken, requireAdmin, requireUser } from '../permission';
import { handleValidationErrors } from '../utils';

import {
  UserRecordListParams,
  UserRecordListResponse,
  UserRecordCreateBody,
  UserRecordCreateResponse,
  RecordListParams,
  RecordListResponse,
  RecordDeleteResponse,
} from '../../interfaces/records';

router.get(
  '/users/:userId/records',
  requireUser,
  param('userId').isInt({ min: 1 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('perPage').optional().isInt({ min: 1, max: 100 }).toInt(),
  handleValidationErrors,
  async (req, res) => {
    const {
      page = 1,
      perPage = 10,
    } = req.query as UserRecordListParams;
    const userId = parseInt(req.params.userId);

    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      throw new HTTPStatusError(404, 'User not found');
    }

    const tokenData = await decodeToken(req);
    if (tokenData.id !== userId && !tokenData.isAdmin) {
      throw new HTTPStatusError(403, '非法操作');
    }

    const { rows, count } = await Record.findAndCountAll({
      include: [{
        model: User,
        as: 'operator',
        attributes: ['realname'],
      }],
      where: {
        userId,
      },
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    const response: UserRecordListResponse = {
      total: count,
      records: rows.map(record => {
        return {
          id: record.id,
          operatorId: record.operatorId,
          operatorName: (record.operator as User).realname,
          createdAt: record.createdAt.toISOString(),
          creditChange: record.creditChange,
          description: record.description,
        };
      })
    };
    res.json(response);
  }
);

router.post(
  '/users/:userId/records',
  requireAdmin,
  param('userId').isInt({ min: 1 }).toInt(),
  body('creditChange').isInt().toInt(),
  body('description').optional().isString().isLength({ max: 255 }),
  handleValidationErrors,
  async (req, res) => {
    const {
      creditChange,
      description
    } = req.body as UserRecordCreateBody;
    const userId = parseInt(req.params.userId);

    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      throw new HTTPStatusError(404, 'User not found');
    }

    const tokenData = await decodeToken(req);
    const operatorId = tokenData.id as number;

    const before = user.credit;    
    const record = await Record.create({
      userId,
      operatorId,
      creditChange,
      description,
    });
    const after = user.credit + record.creditChange;

    const response: UserRecordCreateResponse = {
      id: record.id,
      creditChange,
      description,
      before,
      after,
    };
    res.json(response);
  }
);

router.get(
  '/records',
  requireAdmin,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('perPage').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('query').optional().isString(),
  handleValidationErrors,
  async (req, res) => {
    const {
      page = 1,
      perPage = 10,
      query = '',
    } = req.query as RecordListParams;

    let userIds: number[] = [];

    if (query) {
      const users = await User.findAll({
        attributes: {
          exclude: [
            'password',
            'salt',
          ],
        },
        where: {
          isAdmin: false,
          ...query ? {
            [Op.or]: [
              { username: { [Op.like]: `%${query}%` } },
              { realname: { [Op.like]: `%${query}%` } },
              { phone: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } },
            ]
          } : {},
        },
      });
      userIds = users ? users.map(user => user.id) : [];
    }

    const { rows, count } = await Record.findAndCountAll({
      include: [
        {
          model: User,
          as: 'operator',
          attributes: ['realname'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['realname'],
        }
      ],
      where: {
        ...query ? {
          [Op.in]: {
            userId: userIds,
          }
        } : {},
      },
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    const response: RecordListResponse = {
      total: count,
      records: rows.map(record => {
        return {
          id: record.id,
          userId: record.userId,
          userName: (record.user as User).realname,
          operatorId: record.operatorId,
          operatorName: (record.operator as User).realname,
          createdAt: record.createdAt.toISOString(),
          creditChange: record.creditChange,
          description: record.description,
        };
      })
    };
    res.json(response);
  }
);

router.delete(
  '/records/:recordId',
  param('recordId').isInt({ min: 1 }).toInt(),
  handleValidationErrors,
  requireAdmin,
  async (req, res) => {
    const recordId = parseInt(req.params.recordId);

    const record = await Record.findByPk(recordId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['realname'],
        },
        {
          model: User,
          as: 'operator',
          attributes: ['realname'],
        },
      ],
    });
    if (!record) {
      throw new HTTPStatusError(404, 'Record not found');
    }

    await record.destroy();
    
    const response: RecordDeleteResponse = {
      id: recordId,
      operatorId: record.operatorId,
      operatorName: (record.operator as User).realname,
      createdAt: record.createdAt.toISOString(),
      creditChange: record.creditChange,
      description: record.description,
    };
    res.json(response);
  }
)