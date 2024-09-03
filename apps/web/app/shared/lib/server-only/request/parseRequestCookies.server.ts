import cookie from 'cookie';

export default function parseRequestCookies(request: Request) {
  return cookie.parse(request.headers.get('Cookie') || '');
}
