import { Op } from 'sequelize';
import { body, query } from 'express-validator';

import { router } from '.';
import { HTTPStatusError } from '../error';
import { logger, User } from '../models';
import { createJWT, decodeToken } from '../permission';
import { handleValidationErrors, sendEmail } from '../utils';

import {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
  sendPasswordResetEmailParams,
  resetPasswordBody,
} from '../../interfaces/auth';

router.post(
  '/auth/login',
  body('username').isString().isLength({ min: 5, max: 25 }),
  body('password').isString().matches(/^[a-zA-Z0-9]{5,25}$/),
  handleValidationErrors,
  async (req, res) => {
    const body: LoginBody = req.body;

    const user = await User.find(body.username);

    if (!user || user.isDeleted) {
      throw new HTTPStatusError(401, '用户名无效');
    }

    if (!user.checkPassword(body.password)) {
      throw new HTTPStatusError(401, '密码错误');
    }

    const response: LoginResponse = {
      token: await createJWT(user),
      info: {
        id: user.id,
        username: user.username,
        realname: user.realname,
        phone: user.phone,
        email: user.email,
        isAdmin: user.isAdmin,
      }
    };
    res.json(response);
  }
);

router.post(
  '/auth/register',
  body('username').isString().isLength({ min: 5, max: 25 }),
  body('password').isString().matches(/^[a-zA-Z0-9$@!%*#?&+-_)(]{5,25}$/),
  body('realname').isString().matches(/^[\u4e00-\u9fa5]{2,5}$/),
  body('phone').isString().matches(/^1[3456789]\d{9}$/),
  body('email').isString().isLength({ min: 5, max: 50 }).isEmail(),
  handleValidationErrors,
  async (req, res) => {
    const body: RegisterBody = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: body.username },
          { phone: body.phone },
          { email: body.email },
        ]
      }
    });
    if (user) {
      if (user.username === body.username) {
        throw new HTTPStatusError(400, '用户名已存在');
      }
      if (user.email === body.email) {
        throw new HTTPStatusError(400, '邮箱已存在');
      }
      if (user.phone === body.phone) {
        throw new HTTPStatusError(400, '手机号已存在');
      }
    }

    const { salt, hashed } = await User.genPassword(body.password);

    const isAdmin = await User.count() === 0;

    const newUser = await User.create({
      username: body.username,
      password: hashed,
      salt: salt,
      realname: body.realname,
      phone: body.phone,
      email: body.email,
      isAdmin,
      isDeleted: false,
      credit: 0,
      lastUpdate: null,
    });

    const response: RegisterResponse = {
      token: await createJWT(newUser),
      info: {
        id: newUser.id,
        username: newUser.username,
        realname: newUser.realname,
        phone: newUser.phone,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      }
    };
    res.json(response);
  }
);

const lastSendTime = new Map<string, number>([]);

router.get(
  '/auth/sendPasswordResetEmail',
  query('email').isString().isLength({ min: 5, max: 50 }).isEmail(),
  handleValidationErrors,
  async (req, res) => {
    const { email = '' } = req.query as sendPasswordResetEmailParams;
    const user = await User.findOne({
      where: { email: email }
    });
    if (!user) {
      throw new HTTPStatusError(400, '邮箱不存在');
    }

    const now = Date.now();
    const last = lastSendTime.get(email);
    if (last && now - last < 60 * 1000) {
      throw new HTTPStatusError(400, '请稍后再试');
    }

    const token = await createJWT(user, '1h');
    const url = `${process.env.FRONT_URL}/auth/resetPassword?token=${token}`;
    const html = 
      `<p>请点击下面的链接重置密码：</p>` +
      `<p><a href="${url}">重置密码</a></p>` + 
      `<p>如果链接无法点击，请复制下方链接到浏览器访问：</p>` +
      `<p>${url}</p>`;
      `<p>该链接将在1小时后失效。</p>`;

    sendEmail(
      email,
      '重置密码',
      html
    ).catch(err => {
      logger.error(`Send to send email to ${email}: ${err}`);
    });

    lastSendTime.set(email, Date.now());
    setTimeout(() => {
      lastSendTime.delete(email);
    }, 60 * 1000);

    res.json({});
  }
)

router.post(
  '/auth/resetPassword',
  body('token').isString(),
  body('password').isString().matches(/^[a-zA-Z0-9$@!%*#?&+-_)(]{5,25}$/),
  handleValidationErrors,
  async (req, res) => {
    const { token, password } = req.body as resetPasswordBody;
    let id: number;

    try {
      ({ id } = await decodeToken(`Bearer ${token}`));
    } catch (err) {
      throw new HTTPStatusError(400, '无效的token');
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      throw new HTTPStatusError(400, '无效的token');
    }

    await user.setPassword(password);

    res.json({});
  }
);
