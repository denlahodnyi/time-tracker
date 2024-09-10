import type { MetaFunction } from '@remix-run/node';
import {
  Link,
  useLoaderData,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react';
import { BarChartBigIcon, PlusIcon } from 'lucide-react';

import { CreateNewTaskDialog } from '~/features/tasks/create-task';
import { Button } from '~/shared/ui';
import action from './action.server';
import { ActiveTask } from './ActiveTask';
import loader from './loader.server';
import MyTasksList from './MyTasksList';
import shouldRevalidate from './shouldRevalidate';

export { action, loader, shouldRevalidate };

// TODO: clear on logout
const cachedCursors = new Set<number>();

export async function clientLoader({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const cursor = Number(searchParams.get('cursor')) || null;

  if (cursor && !cachedCursors.has(cursor)) {
    cachedCursors.add(cursor);
  }

  const loaderData = await serverLoader<typeof loader>();

  return {
    ...loaderData,
    initialCursors: Array.from(cachedCursors), // client side field
  };
}

export const meta: MetaFunction = () => {
  return [{ title: 'Time tracker' }];
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader & typeof clientLoader>();

  return (
    <div className="space-y-4 px-3 py-4 md:px-5">
      <ActiveTask />
      <div className="flex gap-5">
        <Button asChild variant="outline">
          <Link to="/analytics">
            <BarChartBigIcon />
            Check my stats
          </Link>
        </Button>
        <CreateNewTaskDialog>
          <Button variant="outline">
            <PlusIcon /> Add new task
          </Button>
        </CreateNewTaskDialog>
      </div>
      <MyTasksList
        activeTask={loaderData.activeTask}
        initialCursors={loaderData.initialCursors}
        initialPage={loaderData.initialPage}
      />
    </div>
  );
}