import type { Response } from 'express';

import { env } from '../../../env.js';

export default function setAuthCookie(response: Response, token: string) {
  response.cookie('auth', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}
