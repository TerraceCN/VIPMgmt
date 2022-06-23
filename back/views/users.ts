import { Op, fn, col } from 'sequelize';
import { body, param, query } from 'express-validator';

import { router } from '.';
import { HTTPStatusError } from '../error';
import { User, Record } from '../models';
import { decodeToken, requireAdmin, requireUser } from '../permission';
import { handleValidationErrors } from '../utils';

import {
  UserListParams,
  UserListResponse,
  UserDetailResponse,
  UserUpdateBody,
  UserUpdateResponse,
  UserDeleteResponse,
  UserSetAdminParams,
} from '../../interfaces/users';

router.get(
  '/users',
  requireAdmin,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('perPage').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('isAdmin').optional().toBoolean(),
  query('query').optional().isString(),
  query('credit').optional().isInt({ min: 0 }).toInt(),
  handleValidationErrors,
  async (req, res) => {
    const {
      page = 1,
      perPage = 10,
      isAdmin,
      query,
      credit,
    } = req.query as UserListParams;

    const users = await User.findAndCountAll({
      attributes: {
        exclude: [
          'password',
          'salt',
        ],
      },
      where: {
        ...typeof isAdmin === 'undefined' ? {} : { isAdmin },
        isDeleted: false,
        ...query ? {
          [Op.or]: [
            { username: { [Op.like]: `%${query}%` } },
            { realname: { [Op.like]: `%${query}%` } },
            { phone: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } },
          ]
        } : {},
        ...credit ? { 
          credit: { [Op.gte]: credit }
        } : {},
      },
      offset: (page - 1) * perPage,
      limit: perPage,
      order: [['id', 'ASC']],
    });

    const response: UserListResponse = {
      users: users.rows.map(user => ({
        id: user.id,
        username: user.username,
        realname: user.realname,
        phone: user.phone,
        email: user.email,
        isAdmin: user.isAdmin,
        credit: user.credit || 0,
        lastUpdate: user.lastUpdate?.toISOString() ?? null,
      })),
      total: users.count,
    };
    res.json(response);
  }
);

router.get(
  '/users/setAdmin',
  query('username').isString().isLength({ min: 5, max: 25 }),
  handleValidationErrors,
  requireAdmin,
  async (req, res) => {
    const { username = '' } = req.query as UserSetAdminParams;
    const user = await User.find(username);
    if (!user || user.isDeleted) {
      throw new HTTPStatusError(404, '用户不存在');
    }
    
    user.isAdmin = true;
    await user.save();

    res.json({});
  }
);

router.get(
  '/users/:userId',
  requireUser,
  param('userId').isInt({ min: 1 }).toInt(),
  handleValidationErrors,
  async (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      throw new HTTPStatusError(404, '用户不存在');
    }

    const tokenData = await decodeToken(req);
    if (tokenData.id !== userId && !tokenData.isAdmin) {
      throw new HTTPStatusError(403, '非法操作');
    }


    const response: UserDetailResponse = {
      id: user.id,
      username: user.username,
      realname: user.realname,
      phone: user.phone,
      email: user.email,
      isAdmin: user.isAdmin,
      credit: user.credit,
      lastUpdate: user.lastUpdate?.toISOString() ?? null,
    };
    res.json(response);
  }
);

router.put(
  '/users/:userId',
  requireUser,
  param('userId').isInt({ min: 1 }).toInt(),
  body('username').isString().isLength({ min: 1, max: 25 }),
  body('realname').isString().isLength({ min: 1, max: 25 }),
  body('phone').isString().isLength({ min: 1, max: 25 }),
  body('email').isString().isLength({ min: 1, max: 25 }),
  body('isAdmin').isBoolean(),
  async (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      throw new HTTPStatusError(404, '用户不存在');
    }

    const tokenData = await decodeToken(req);
    if (tokenData.id !== userId && !tokenData.isAdmin) {
      throw new HTTPStatusError(403, '非法操作');
    }

    const body = req.body as UserUpdateBody;

    const updatedData = {
      username: body.username,
      realname: body.realname,
      phone: body.phone,
      email: body.email,
      ...tokenData.isAdmin
        ? { isAdmin: body.isAdmin }
        : { isAdmin: user.isAdmin },
    };
    await user.update(updatedData);

    const response: UserUpdateResponse = {
      id: user.id,
      ...updatedData,
    };
    res.json(response);
  }
);

router.delete(
  '/users/:userId',
  requireAdmin,
  param('userId').isInt({ min: 1 }).toInt(),
  handleValidationErrors,
  async (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      throw new HTTPStatusError(404, '用户不存在');
    }

    const tokenData = await decodeToken(req);

    if (userId === tokenData.id as number) {
      throw new HTTPStatusError(403, '您不能删除自己的账号');
    }
    
    if (await Record.count({ where: { operatorId: userId } }) > 0) {
      user.isDeleted = true;
      await user.save();
    } else {
      await Record.destroy({ where: { userId } });
      await user.destroy();
    }

    const response: UserDeleteResponse = {
      id: user.id,
      username: user.username,
      realname: user.realname,
      phone: user.phone,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    res.json(response);
  }
);

router.get(
  '/users/:userId/cancelAdmin',
  param('userId').isInt({ min: 1 }).toInt(),
  handleValidationErrors,
  requireAdmin,
  async (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      throw new HTTPStatusError(404, '用户不存在');
    }
    
    user.isAdmin = false;
    await user.save();

    res.json({});
  }
);
