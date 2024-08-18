import { useFetcher } from '@remix-run/react';
import { useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { EyeIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  Task,
  taskApi,
  taskLib,
  type AllTasksQueryData,
  type TaskBase,
} from '~/entities/task';
import { Button, Heading, useErrorAlert } from '~/shared/ui';
import type action from './action.server';
import DeleteTaskAlert from './DeleteTaskAlert';
import TaskDetailsDialog from './TaskDetailsDialog';

const START_TASK_ACTION = 'startTask';

interface TaskProps {
  id: TaskBase['id'];
  name: TaskBase['name'];
  totalTimeSpent: TaskBase['totalTimeSpent'];
  className?: string;
}

function TaskModel(props: TaskProps) {
  const queryClient = useQueryClient();
  const fetcher = useFetcher<typeof action>();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const startedAtInputRef = useRef<HTMLInputElement>(null);
  const isLoading = fetcher.state !== 'idle';
  const { error, errors, data: successData } = fetcher.data || {};
  const fetcherAction = fetcher.data?.data && fetcher.data._action;
  const timeSpent = taskLib.formatTotalTimeSpent(props.totalTimeSpent || 0);

  useErrorAlert(fetcher.state === 'idle' && !errors ? error : null);

  useEffect(() => {
    if (fetcherAction === START_TASK_ACTION && successData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { timeEntries, ...taskWithoutEntries } = successData.task;

      queryClient.setQueryData(
        taskApi.queries.tasks.myActive.queryKey,
        successData.task,
      );
      queryClient.setQueryData(
        taskApi.queries.tasks.myAll.queryKey,
        (prev: AllTasksQueryData) => {
          let taskIdx: number;
          const pageIdx = prev.pages.findIndex((page) => {
            const idx = page.tasks.findIndex(
              (t) => t.id === successData.task.id,
            );

            if (idx !== -1) taskIdx = idx;

            return idx !== -1;
          });

          if (pageIdx !== -1) {
            return produce(prev, (draft) => {
              draft.pages[pageIdx].tasks[taskIdx] = { ...taskWithoutEntries };
            });
          }
        },
      );
    }
  }, [fetcherAction, queryClient, successData]);

  return (
    <Task.TaskCard asChild className={props.className}>
      <article>
        <Heading as="h2" className="text-lg">
          {props.name}
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
            <input name="taskId" type="hidden" value={props.id} />
            <Task.StartButton
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
              taskId={props.id}
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
            <DeleteTaskAlert taskId={props.id}>
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

export default TaskModel;
