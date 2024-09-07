import { Outlet } from '@remix-run/react';

import MainHeader from './MainHeader';

export default function MainLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-screen-xl">
      <MainHeader />
      <Outlet />
    </div>
  );
}
