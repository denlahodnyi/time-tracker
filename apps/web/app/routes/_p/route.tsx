import { Outlet } from '@remix-run/react';

import loader from './loader.server';
import shouldRevalidate from './shouldRevalidate';

export { loader, shouldRevalidate };

export default function ProtectedLayout() {
  return <Outlet />;
}
