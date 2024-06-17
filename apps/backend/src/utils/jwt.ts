import jwt from 'jsonwebtoken';

import { env } from '../../env.js';

interface JwtPayload {
  userId: number;
}

const verifyJwt = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

const signJwt = (payload: JwtPayload) => {
  return jwt.sign({ userId: payload.userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export { verifyJwt, signJwt };
