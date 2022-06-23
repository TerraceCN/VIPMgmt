import * as jose from 'jose';
import { Request, Response, NextFunction } from 'express';

import { User } from './models';
import { HTTPStatusError } from './error';
import { JWT_SECRET } from './config';

let key: jose.KeyLike | null = null;

export async function loadKey() {
  if (!key) {
    key = (await jose.importJWK({
      alg: "HS256",
      kty: "oct",
      k: JWT_SECRET,
    })) as jose.KeyLike;
  }
  return key
}

interface JWTData {
  id: number;
  isAdmin: boolean;

  [key: string]: any;
}

export async function createJWT(user: User, expiredIn: string | number = '31d') {
  const data: JWTData = {
    id: user.id,
    isAdmin: user.isAdmin,
  }
  return await new jose.SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiredIn)
    .sign(await loadKey());
}

export async function decodeToken(req: Request | string) {
  let authorization: string;
  if (typeof req === 'string') {
    authorization = req;
  } else {
    const auth = req.headers.authorization;
    if (!auth) {
      throw new HTTPStatusError(401, "Unauthorized");
    }
    authorization = auth;
  }
  
  const [type, token] = authorization.split(' ');
  

  if (type === 'Bearer') {
    try {
      const { payload } = await jose.jwtVerify(token, key as jose.KeyLike);
      return payload as JWTData
    } catch (err) {
      throw new HTTPStatusError(401, "Unauthorized");
    }
  } else {
    throw new HTTPStatusError(401, "Invalid token");
  }
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  decodeToken(req);
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((await decodeToken(req)).isAdmin) {
    next();
  } else {
    throw new HTTPStatusError(403, "非法操作");
  }
}
