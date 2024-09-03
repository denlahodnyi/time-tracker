export default function getCookie(req: Request) {
  return req.headers.get('Cookie') ?? '';
}
