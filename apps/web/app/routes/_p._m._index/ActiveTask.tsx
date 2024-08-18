import { useFetcher } from '@remix-run/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { useEffect, useRef } from 'react';

import {
  Task,
  taskApi,
  type AllTasksQueryData,
  type TaskBase,
} from '~/entities/task';
import { cn, useFormErrors } from '~/shared/lib';
import { TextField, useErrorAlert } from '~/shared/ui';
import type action from './action.server';

const START_NEW_TASK_ACTION = 'createAndStartTask';
const STOP_TASK_ACTION = 'stopTask';

interface FormElements extends HTMLFormControlsCollection {
  startedAt: HTMLInputElement;
  finishedAt: HTMLInputElement;
  taskId: HTMLInputElement;
  entryId: HTMLInputElement;
}

interface ActiveTaskProps {
  className?: string;
}

interface TaskBaseWithEntries
  extends Omit<TaskBase, 'timeEntries'>,
    Required<Pick<TaskBase, 'timeEntries'>> {}

function ActiveTask(props: ActiveTaskProps) {
  const queryClient = useQueryClient();
  const { data: cachedTask } = useQuery<TaskBaseWithEntries>({
    queryKey: taskApi.queries.tasks.myActive.queryKey,
  });
  const fetcher = useFetcher<typeof action>({ key: 'new-task-start-fetcher' });
  const formRef = useRef<HTMLFormElement>(null);
  const isLoading = fetcher.state !== 'idle';
  const { data: successData, error, errors } = fetcher.data || {};
  const fetcherAction = fetcher.data?.data && fetcher.data._action;
  const taskId = cachedTask?.id;
  const isInProgress = !!cachedTask;
  const timeEntry = cachedTask?.timeEntries[0];
  const entryId = timeEntry?.id;
  const formErrors = useFormErrors(errors, ['name']);

  useErrorAlert(fetcher.state === 'idle' && !errors ? error : null);

  useEffect(() => {
    if (successData && fetcherAction === START_NEW_TASK_ACTION) {
      if (formRef.current) formRef.current.reset();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { timeEntries, ...taskWithoutEntries } = successData.task;

      queryClient.setQueryData(
        taskApi.queries.tasks.myActive.queryKey,
        successData.task,
      );
      queryClient.setQueryData(
        taskApi.queries.tasks.myAll.queryKey,
        (prev: AllTasksQueryData) => {
          return produce(prev, (draft) => {
            draft.pages[0].tasks.unshift(taskWithoutEntries);
          });
        },
      );
    } else if (successData && fetcherAction === STOP_TASK_ACTION) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { timeEntries, ...taskWithoutEntries } = successData.task;

      queryClient.setQueryData(taskApi.queries.tasks.myActive.queryKey, null);
      queryClient.setQueryData(
        taskApi.queries.tasks.myAll.queryKey,
        (prev: AllTasksQueryData) => {
          let taskIdx: number;
          const pageIdx = prev.pages.findIndex((page) => {
            // task.id === fetcherData.task.id;
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
    <Task.TaskCard className={cn('group/container', props.className)}>
      <h2
        className={`hidden group-has-[button[value=stopTask]]/container:inline`}
      >
        {cachedTask?.name}
      </h2>
      <fetcher.Form
        ref={formRef}
        action="/?index"
        className="hidden group-has-[button[value=createAndStartTask]]/container:inline"
        id="create-and-start-form"
        method="post"
        onSubmit={(e) => {
          if (isLoading) {
            e.preventDefault();

            return;
          }
          if (formRef.current) {
            const elements = formRef.current.elements as FormElements;

            elements.startedAt.value = new Date().toISOString();
            elements.finishedAt.value = new Date().toISOString();
          }
        }}
      >
        <TextField
          autoComplete="off"
          error={formErrors.name?.[0]}
          label="Task name"
          name="name"
          placeholder="My current task is..."
          required={!isInProgress}
        />

        <input name="startedAt" type="hidden" />
        <input name="finishedAt" type="hidden" />
        <input name="taskId" type="hidden" value={taskId || ''} />
        <input name="entryId" type="hidden" value={entryId || ''} />
      </fetcher.Form>
      <div className="col-[3_/_-1] flex items-center gap-3 justify-self-end">
        {fetcher.state === 'idle' && isInProgress && timeEntry?.startedAt && (
          <Task.TaskTimer startDate={new Date(timeEntry.startedAt)} />
        )}
        <Task.StartButton
          form="create-and-start-form"
          isInProgress={isInProgress}
          isLoading={isLoading}
          name="_action"
          type="submit"
          value={isInProgress ? STOP_TASK_ACTION : START_NEW_TASK_ACTION}
          variant="default"
        />
      </div>
    </Task.TaskCard>
  );
}

export { ActiveTask };
