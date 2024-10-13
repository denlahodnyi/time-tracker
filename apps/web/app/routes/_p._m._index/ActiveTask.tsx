import { useFetcher, useLoaderData } from '@remix-run/react';
import React, { useEffect, useRef } from 'react';

import { Task } from '~/entities/task';
import { formatTotalTimeSpent } from '~/entities/task/lib';
import { START_NEW_TASK_ACTION } from '~/features/tasks/create-task';
import { STOP_TASK_ACTION } from '~/features/tasks/stop-task';
import { cn, useFormErrors } from '~/shared/lib';
import { Heading, TextField, useErrorAlert } from '~/shared/ui';
import type action from './action.server';
import type loader from './loader.server';

interface FormElements extends HTMLFormControlsCollection {
  startedAt: HTMLInputElement;
  finishedAt: HTMLInputElement;
  taskId: HTMLInputElement;
  entryId: HTMLInputElement;
}

interface CreateTaskFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

interface ActiveTaskProps {
  className?: string;
}

function ActiveTask(props: ActiveTaskProps) {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>({ key: 'new-task-start-fetcher' });
  const formRef = useRef<HTMLFormElement>(null);
  const isLoading = fetcher.state !== 'idle';
  const { error, errors } = fetcher.data || {};
  const isSuccessStop =
    !isLoading &&
    fetcher.data?.data?.task &&
    fetcher.data._action === STOP_TASK_ACTION;
  const activeTask = loaderData.data?.activeTask;
  const isInProgress = !!activeTask;
  const timeEntry = activeTask?.timeEntries?.[0];
  const formErrors = useFormErrors(errors, ['name']);

  useErrorAlert(fetcher.state === 'idle' && !errors ? error : null);

  useEffect(() => {
    if (isSuccessStop && formRef.current) formRef.current.reset();
  }, [isSuccessStop]);

  return (
    <Task.TaskCard
      className={cn('group/container', props.className)}
      data-testid="active-task"
    >
      {isInProgress ? (
        <Heading as="h2" className="text-base md:text-xl">
          {activeTask?.name}
        </Heading>
      ) : (
        <fetcher.Form
          ref={formRef}
          action="/?index"
          id="create-and-start-form"
          method="post"
          onSubmit={(e: React.FormEvent<CreateTaskFormElement>) => {
            if (isLoading) {
              e.preventDefault();

              return;
            }

            const { startedAt } = e.currentTarget.elements;

            startedAt.value = new Date().toISOString();
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
        </fetcher.Form>
      )}
      <div className="col-[3_/_-1] flex items-center gap-3 justify-self-end">
        {fetcher.state === 'idle' && isInProgress && timeEntry?.startedAt && (
          <div className="text-right">
            <Task.TaskTimer
              startDate={new Date(timeEntry.startedAt)}
              totalTimeSpent={0} // Pass 0 to not count already spent time
            />
            {activeTask.totalTimeSpent && activeTask.totalTimeSpent > 0 ? (
              <p className="text-wrap text-sm text-muted-foreground">
                {`Last spent: ${formatTotalTimeSpent(activeTask.totalTimeSpent)}`}
              </p>
            ) : null}
          </div>
        )}
        {isInProgress ? (
          <fetcher.Form
            ref={formRef}
            action="/?index"
            method="post"
            onSubmit={(e) => {
              if (isLoading) {
                e.preventDefault();

                return;
              }
              if (formRef.current) {
                const elements = formRef.current.elements as FormElements;

                elements.finishedAt.value = new Date().toISOString();
              }
            }}
          >
            <input name="finishedAt" type="hidden" />
            <input
              name="taskId"
              type="hidden"
              value={(activeTask && activeTask.id) || ''}
            />
            <input name="entryId" type="hidden" value={timeEntry?.id || ''} />
            <Task.MainAction
              isInProgress={true}
              isLoading={isLoading}
              name="_action"
              type="submit"
              value={STOP_TASK_ACTION}
              variant="default"
            />
          </fetcher.Form>
        ) : (
          <Task.MainAction
            form="create-and-start-form"
            isInProgress={false}
            isLoading={isLoading}
            name="_action"
            type="submit"
            value={START_NEW_TASK_ACTION}
            variant="default"
          />
        )}
      </div>
    </Task.TaskCard>
  );
}

export { ActiveTask };
