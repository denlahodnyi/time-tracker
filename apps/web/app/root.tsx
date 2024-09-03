import type { ActionFunctionArgs } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from '@remix-run/react';

import '~/base/styles/tailwind.css';
import { Toaster } from '~/shared/ui';
import { logout } from './shared/api/server';
import { parseRequestFormData } from './shared/lib';

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        {loaderData && loaderData.ENV && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(loaderData.ENV)}`,
            }}
          ></script>
        )}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export function shouldRevalidate() {
  return false;
}

export async function loader() {
  return json({
    ENV: {
      API_URL: process.env.API_URL,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await parseRequestFormData<{ _action?: string }>(request);

  if (data._action === 'logout') logout(request);
}
