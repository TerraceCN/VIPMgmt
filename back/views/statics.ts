import { query } from 'express-validator';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

import { router } from '.';
import { HTTPStatusError } from '../error';
import { Record } from '../models';
import { requireAdmin } from '../permission';
import { handleValidationErrors } from '../utils';

import {
  StaticRecordParams,
  StaticRecordResponse,
} from '../../interfaces/statics';

router.get(
  '/statics/records',
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  handleValidationErrors,
  requireAdmin,
  async (req, res) => {
    const today = dayjs().endOf('day');
    const sevenDaysAgo = dayjs().subtract(7, 'day').startOf('day');
    const {
      from = sevenDaysAgo.toISOString(),
      to = today.toISOString(),
    } = req.query as StaticRecordParams;

    if (from > to) {
      throw new HTTPStatusError(400, '开始时间必须小于结束时间');
    }

    const fromDay = dayjs(from).startOf('day');
    const toDay = dayjs(to).endOf('day');

    const records = await Record.findAll({
      where: {
        createdAt: {
          [Op.between]: [fromDay.toDate(), toDay.toDate()],
        },
      },
      order: [['createdAt', 'ASC']],
    });
    
    let labels: string[] = [];
    let sum_positive: number[] = [];
    let sum_negative: number[] = [];
    let count_positive: number[] = [];
    let count_negative: number[] = [];

    for (let day = fromDay.clone(); day <= toDay; day = day.add(1, 'day')) {
      labels.push(day.format('YYYY-MM-DD'));
      sum_positive.push(0);
      sum_negative.push(0);
      count_positive.push(0);
      count_negative.push(0);
    }

    for (let record of records) {
      const day = dayjs(record.createdAt);
      const dayOffset = day.diff(fromDay, 'day');
      if (record.creditChange >= 0) {
        sum_positive[dayOffset] += record.creditChange;
        count_positive[dayOffset] += 1;
      } else {
        sum_negative[dayOffset] -= record.creditChange;
        count_negative[dayOffset] += 1;
      }
    }

    const response: StaticRecordResponse = {
      labels,
      sum: {
        positive: sum_positive,
        negative: sum_negative,
      },
      count: {
        positive: count_positive,
        negative: count_negative,
      },
    };

    res.json(response);
  }
);
