import { Outlet } from '@remix-run/react';

import MainHeader from './MainHeader';

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <MainHeader />
      <Outlet />
    </div>
  );
}
