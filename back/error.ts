import express from 'express';

import { getLogger } from './logging';

const logger = getLogger('express');

export class HTTPStatusError extends Error {
  code: number;
  reason: string;
  constructor(code: number, reason: string) {
    super(`HTTP ${code} ${reason}`);
    this.code = code;
    this.reason = reason;
  }
}

export const errorHandler = (err: Error, req: express.Request, res: express.Response, next: Function) => {
  if (err instanceof HTTPStatusError) {
    res.status(err.code).json({ reason: err.reason });
  } else {
    logger.error(`Unknown error: ${err.message}`);
    res.status(500).send({ reason: err.message });
  }
}