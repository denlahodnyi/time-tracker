import { useFetcher } from '@remix-run/react';
import {
  CheckCheckIcon,
  CheckIcon,
  EllipsisIcon,
  EyeIcon,
  Trash2Icon,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Task, taskLib, type TaskBase } from '~/entities/task';
import { COMPLETE_TASK_ACTION } from '~/features/tasks/complete';
import { DeleteTaskAlert } from '~/features/tasks/delete-task';
import { START_TASK_ACTION } from '~/features/tasks/start-task';
import { cn } from '~/shared/lib';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Heading,
  useErrorAlert,
} from '~/shared/ui';
import type action from './action.server';
import TaskDetailsDialog from './TaskDetailsDialog';

interface TaskProps {
  task: Pick<
    TaskBase,
    'id' | 'name' | 'description' | 'totalTimeSpent' | 'completedAt'
  >;
  className?: string;
  taskToolbarClassName?: string;
  taskToolbarExtraActionsClassName?: string;
}
interface CompletionFormElements extends HTMLFormControlsCollection {
  completedAt: HTMLInputElement;
}
interface CompletionForm extends HTMLFormElement {
  readonly elements: CompletionFormElements;
}

function TaskItem(props: TaskProps) {
  const {
    className,
    taskToolbarClassName,
    taskToolbarExtraActionsClassName,
    task,
  } = props;
  const fetcher = useFetcher<typeof action>();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const startedAtInputRef = useRef<HTMLInputElement>(null);
  const isLoading = fetcher.state !== 'idle';
  const isStartLoading =
    isLoading && fetcher.formData?.get('_action') === START_TASK_ACTION;
  const { error, errors } = fetcher.data || {};
  const timeSpent = taskLib.formatTotalTimeSpent(task.totalTimeSpent || 0);

  useErrorAlert(fetcher.state === 'idle' && !errors ? error : null);

  return (
    <Task.TaskCard
      asChild
      className={cn('grid-cols-1 md:grid-cols-2', className)}
    >
      <article data-testid="task">
        <div>
          <Heading as="h2" className="text-base md:text-lg">
            {task.name}
          </Heading>
          {task.completedAt && (
            <span className="text-sm text-muted-foreground">
              <CheckCheckIcon className="inline h-4 w-4" /> Completed
            </span>
          )}
        </div>
        <div
          className={cn(
            'task-toolbar flex items-center gap-3 justify-self-end md:gap-4',
            taskToolbarClassName,
          )}
        >
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
              isLoading={isStartLoading}
              name="_action"
              type="submit"
              value={START_TASK_ACTION}
            />
          </fetcher.Form>
          <div
            className={cn(
              'task-toolbar__extra-actions -my-2 -mr-1 flex grid-cols-1 flex-row gap-3 sm:grid-cols-2 md:flex-col md:gap-1',
              taskToolbarExtraActionsClassName,
            )}
          >
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Show additional actions"
                  className="h-auto w-auto rounded-full p-1"
                  variant="outline"
                >
                  <EllipsisIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <fetcher.Form
                  action="/?index"
                  method="post"
                  onSubmit={(e: React.FormEvent<CompletionForm>) => {
                    if (isLoading) {
                      e.preventDefault();

                      return;
                    }

                    const { completedAt } = e.currentTarget.elements;

                    completedAt.value = new Date().toISOString();
                  }}
                >
                  <input name="taskId" type="hidden" value={task.id} />
                  <input name="completedAt" type="hidden" value="" />
                  <DropdownMenuItem asChild>
                    <Button
                      className="w-full justify-start p-0"
                      disabled={!!task.completedAt}
                      name="_action"
                      type="submit"
                      value={COMPLETE_TASK_ACTION}
                      variant="ghost"
                    >
                      <CheckIcon className="h-5 w-5" />
                      Mark as done
                    </Button>
                  </DropdownMenuItem>
                </fetcher.Form>
                <DeleteTaskAlert taskId={task.id}>
                  <DropdownMenuItem
                    asChild
                    // Prevent closing Alert after dropdown item select
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Button
                      className="w-full justify-start p-0"
                      variant="ghost"
                    >
                      <Trash2Icon className="h-5 w-5" />
                      Delete task
                    </Button>
                  </DropdownMenuItem>
                </DeleteTaskAlert>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </article>
    </Task.TaskCard>
  );
}

export default TaskItem;
