import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, redirect } from '@remix-run/react';

import { parseRequestCookies } from '~/shared/server-side';

export function shouldRevalidate() {
  return false;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const parsedCookies = parseRequestCookies(request);

  if (parsedCookies.auth) {
    throw redirect('/');
  }

  return null;
}

export default function AuthLayout() {
  return <Outlet />;
}
