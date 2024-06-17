import type { User } from '@libs/prisma';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export async function loader() {
  // const cl = new PrismaClient();
  const response = await fetch('http://localhost:3000/api/users');
  const { data, status } = await response.json();

  return (status === 'success' ? data.users : []) as User[];
}

export default function Index() {
  const users = useLoaderData<typeof loader>();

  return (
    <div className="p-4 font-sans">
      <h1 className="text-3xl">Welcome to Remix</h1>
      <ul className="mt-4 list-disc space-y-2 pl-6">
        {users.map((user, i) => (
          <li key={i}>{user.firstName}</li>
        ))}
      </ul>
    </div>
  );
}
