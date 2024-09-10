import { useFetchers } from '@remix-run/react';
import { Fragment, useEffect } from 'react';
import { useImmer } from 'use-immer';

import type { TaskBase } from '~/entities/task';
import { COMPLETE_TASK_ACTION } from '~/features/tasks/complete';
import { DELETE_TASK_ACTION } from '~/features/tasks/delete-task';
import { UPDATE_TASK_ACTION } from '~/features/tasks/update-task';
import type { CursorPagination } from '~/shared/api';
import { cn, useEnhancedFetcher } from '~/shared/lib';
import { Button } from '~/shared/ui';
import type action from './action.server';
import PageFetcher from './PageFetcher';
import TaskItem from './TaskItem';

interface MyTasksListProps {
  initialCursors: number[];
  initialPage: {
    tasks: TaskBase[];
    pagination: CursorPagination;
  } | null;
  activeTask: TaskBase | null;
}

type Pages = (
  | (NonNullable<MyTasksListProps['initialPage']> & { cursor: number })
  | { cursor: number; tasks: null; pagination: null }
)[];

function MyTasksList(props: MyTasksListProps) {
  // fetcher.load doesn't trigger initialCursors update
  const { activeTask, initialCursors, initialPage } = props;

  useEnhancedFetcher<typeof action>({
    key: UPDATE_TASK_ACTION,
    checkSuccess: (data) => Boolean(data.data?.task),
    // Reset pages to trigger revalidation in useEffect
    onSuccess: () => setPages([]),
  });

  useEnhancedFetcher<typeof action>({
    key: DELETE_TASK_ACTION,
    checkSuccess: (data) => Boolean(data.data?.task),
    // Reset pages to trigger revalidation in useEffect
    onSuccess: () => setPages([]),
  });

  useEnhancedFetcher<typeof action>({
    key: COMPLETE_TASK_ACTION,
    checkSuccess: (data) => Boolean(data.data?.task),
    // Reset pages to trigger revalidation in useEffect
    onSuccess: () => setPages([]),
  });

  const [pages, setPages] = useImmer<Pages>([]);
  const lastPage = pages.at(-1);
  let nextCursor = initialPage?.pagination.nextCursor;

  if (lastPage) {
    nextCursor = lastPage.pagination
      ? lastPage.pagination.nextCursor
      : lastPage.cursor;
  }

  const lastPageFetcher = useFetchers().filter(
    (f) => f.key === lastPage?.cursor.toString(),
  )[0];
  const isFetchingNextPage = lastPageFetcher
    ? lastPageFetcher.state !== 'idle'
    : false;

  useEffect(() => {
    setPages([]);
  }, [initialCursors, setPages]);

  useEffect(() => {
    // If initialCursors is not empty – fetch each page, but not using cached
    // cursors to get up-to-date pages
    if (
      initialCursors.length &&
      pages.length < initialCursors.length &&
      nextCursor
    ) {
      setPages((draft) => {
        const exists = draft.find((o) => o.cursor === nextCursor && !o.tasks);

        if (!exists) {
          draft.push({
            cursor: nextCursor,
            pagination: null,
            tasks: null,
          });
        }
      });
    }
  }, [initialCursors.length, nextCursor, pages.length, setPages]);

  return (
    <div className="group space-y-2">
      <p className="hidden text-muted-foreground [&:not(:has(+[data-component='task']))]:block">
        You have no tasks yet
      </p>
      {[...(initialPage ? [initialPage] : []), ...pages].map((page, i) => (
        <Fragment key={`page_${i}`}>
          {(() => {
            if (!page.tasks) {
              return (
                <PageFetcher
                  cursor={page.cursor}
                  onSuccess={function (d): void {
                    setPages((draft) => {
                      const draftPage = draft.find(
                        (o) => o.cursor === page.cursor,
                      );

                      if (draftPage) {
                        draftPage.tasks = d.tasks;
                        draftPage.pagination = d.pagination;
                      }
                    });
                  }}
                />
              );
            }

            return page.tasks.map((t) => (
              <TaskItem
                key={t.id}
                className={cn({ hidden: t.id === activeTask?.id })}
                task={t}
              />
            ));
          })()}
        </Fragment>
      ))}
      <div className="flex justify-center">
        {nextCursor && (
          <Button
            aria-disabled={isFetchingNextPage}
            isLoading={isFetchingNextPage}
            variant="outline"
            onClick={() => {
              setPages((draft) => {
                draft.push({
                  cursor: nextCursor,
                  pagination: null,
                  tasks: null,
                });
              });
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
