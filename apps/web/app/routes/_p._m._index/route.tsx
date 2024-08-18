import type { MetaFunction } from '@remix-run/node';
import { PlusIcon } from 'lucide-react';

import { Button } from '~/shared/ui';
import action from './action.server';
import { ActiveTask } from './ActiveTask';
import CreateNewTaskDialog from './CreateNewTaskDialog';
import MyTasksList from './MyTasksList';

export { action };

export const meta: MetaFunction = () => {
  return [{ title: 'Time tracker' }];
};

export default function Index() {
  return (
    <div className="space-y-4 px-5 py-4">
      <ActiveTask />
      <CreateNewTaskDialog>
        <Button variant="outline">
          <PlusIcon /> Add new task
        </Button>
      </CreateNewTaskDialog>
      <MyTasksList />
    </div>
  );
}
