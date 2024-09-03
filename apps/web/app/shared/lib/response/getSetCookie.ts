export default function getSetCookie(res: Response) {
  return res.headers.get('Set-Cookie') ?? '';
}
