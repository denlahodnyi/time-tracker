import { redirect } from '@remix-run/node';

import parseCookies from './parseRequestCookies.server';
import getNullifiedAuthCookie from '../getNullifiedAuthCookie.server';

export default function requireAuthRequest(request: Request) {
  const parsedCookies = parseCookies(request);
  const url = new URL(request.url);

  if (!parsedCookies.auth) {
    const nextPath = url.pathname + url.search;
    const nextHash = url.hash.replace('#', '');

    throw redirect(
      url.pathname !== '/'
        ? `/login?nextPath=${nextPath}${nextHash ? `&nextHash=${nextHash}` : ''}`
        : '/login',
      {
        headers: {
          'Set-Cookie': getNullifiedAuthCookie(),
        },
      },
    );
  }
}
