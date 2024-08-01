import type { ActionFunctionArgs } from '@remix-run/node';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  redirect,
  useLoaderData,
} from '@remix-run/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ReactQueryProvider } from '~/base/providers';
import '~/base/styles/tailwind.css';
import {
  getNullifiedAuthCookie,
  parseRequestFormData,
} from '~/shared/server-side';
import { Toaster } from '~/shared/ui';

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(loaderData.ENV)}`,
          }}
        ></script>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ReactQueryProvider>
      <Outlet />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </ReactQueryProvider>
  );
}

export async function loader() {
  return json({
    ENV: {
      API_URL: process.env.API_URL,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const data = await parseRequestFormData(request);

  if (data._action === 'logout') {
    console.log('--- LOGOUT ---');

    throw redirect('/login', {
      headers: {
        'Set-Cookie': getNullifiedAuthCookie(),
      },
    });
  }
}
