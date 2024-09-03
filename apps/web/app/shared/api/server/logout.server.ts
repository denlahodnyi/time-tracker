import { redirect } from '@remix-run/node';

import { getNullifiedCookies } from '~/shared/lib/server-only';

export default function logout(req: Request) {
  console.log('--- LOGOUT ---');

  throw redirect('/login', {
    headers: getNullifiedCookies(req),
  });
}
