import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { taskApi, type TaskBase } from '~/entities/task';
import { cn } from '~/shared/lib';
import { Button } from '~/shared/ui';
import Task from './Task';

function MyTasksList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    taskApi.useMyTasks();
  const { data: activeTask } = useQuery<TaskBase>({
    queryKey: taskApi.queries.tasks.myActive.queryKey,
  });

  return (
    <div className="group space-y-2">
      <p className="hidden text-slate-600 [&:not(:has(+[data-component='task']))]:block">
        You have no tasks yet
      </p>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.tasks.map((task) => (
            <Task
              key={task.id}
              className={cn({ hidden: task.id === activeTask?.id })}
              id={task.id}
              name={task.name}
              totalTimeSpent={task.totalTimeSpent}
            />
          ))}
        </React.Fragment>
      ))}
      <div className="flex justify-center">
        {hasNextPage && (
          <Button
            aria-disabled={isFetchingNextPage}
            isLoading={isFetchingNextPage}
            variant="outline"
            onClick={() => {
              if (!isFetchingNextPage) fetchNextPage();
            }}
          >
            Load more
          </Button>
        )}
      </div>
    </div>
  );
}

export default MyTasksList;
