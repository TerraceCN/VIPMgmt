import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';

import {
  SMTP_SERVER,
  SMTP_USERNAME,
  SMTP_PASSWORD,
} from './config';
import { getLogger } from './logging';

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      reason: '请求体错误',
      detail: errors.array(),
    });
  }
  next();
}

export async function sendEmail(
  to: string,
  subject: string,
  content: string,
): Promise<void> {
  const logger = getLogger('email');
  
  let transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    secure: true,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"会员管理系统" <${SMTP_USERNAME}>`,
      to,
      subject,
      html: content,
    });
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error}`);
  }
}