import cookie from 'cookie';

export default function getNullifiedCookies(req: Request) {
  const nullifiedCookies: [string, string][] = [];

  Object.entries(cookie.parse(req.headers.get('Cookie') || '')).forEach(
    ([name]) => {
      nullifiedCookies.push([
        'Set-Cookie',
        cookie.serialize(name, '', { maxAge: 0 }),
      ]);
    },
  );

  return nullifiedCookies;
}
