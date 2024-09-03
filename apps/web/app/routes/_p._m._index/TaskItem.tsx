import { useFetcher } from '@remix-run/react';
import { EyeIcon, Trash2Icon } from 'lucide-react';
import { useRef, useState } from 'react';

import { Task, taskLib, type TaskBase } from '~/entities/task';
import { DeleteTaskAlert } from '~/features/tasks/delete-task';
import { START_TASK_ACTION } from '~/features/tasks/start-task';
import { Button, Heading, useErrorAlert } from '~/shared/ui';
import type action from './action.server';
import TaskDetailsDialog from './TaskDetailsDialog';

interface TaskProps {
  task: Pick<TaskBase, 'id' | 'name' | 'description' | 'totalTimeSpent'>;
  className?: string;
}

function TaskItem(props: TaskProps) {
  const { className, task } = props;
  const fetcher = useFetcher<typeof action>();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const startedAtInputRef = useRef<HTMLInputElement>(null);
  const isLoading = fetcher.state !== 'idle';
  const { error, errors } = fetcher.data || {};
  const timeSpent = taskLib.formatTotalTimeSpent(task.totalTimeSpent || 0);

  useErrorAlert(fetcher.state === 'idle' && !errors ? error : null);

  return (
    <Task.TaskCard asChild className={className}>
      <article>
        <Heading as="h2" className="text-lg">
          {task.name}
        </Heading>
        <div className="flex items-center gap-4 justify-self-end">
          <p>{timeSpent}</p>
          <fetcher.Form
            action="/?index"
            method="post"
            onSubmit={(e) => {
              if (isLoading) {
                e.preventDefault();

                return;
              }
              if (startedAtInputRef.current) {
                startedAtInputRef.current.value = new Date().toISOString();
              }
            }}
          >
            <input
              ref={startedAtInputRef}
              name="startedAt"
              type="hidden"
              value=""
            />
            <input name="taskId" type="hidden" value={task.id} />
            <Task.MainAction
              isInProgress={false}
              isLoading={isLoading}
              name="_action"
              type="submit"
              value={START_TASK_ACTION}
            />
          </fetcher.Form>
          <div className="-my-2 -mr-1 flex flex-col gap-1">
            <TaskDetailsDialog
              open={isDetailsDialogOpen}
              task={task}
              onOpenChange={setIsDetailsDialogOpen}
            />
            <Button
              aria-label="View details"
              className="h-auto w-auto rounded-full p-1"
              title="View details"
              variant="outline"
              onClick={() => setIsDetailsDialogOpen(true)}
            >
              <EyeIcon className="h-5 w-5" />
            </Button>
            <DeleteTaskAlert taskId={task.id}>
              <Button
                aria-label="Delete task"
                className="h-auto w-auto rounded-full p-1"
                title="Delete task"
                variant="outline"
              >
                <Trash2Icon className="h-5 w-5" />
              </Button>
            </DeleteTaskAlert>
          </div>
        </div>
      </article>
    </Task.TaskCard>
  );
}

export default TaskItem;
