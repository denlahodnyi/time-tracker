import { useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';

import type { TasksFilterByUrlParam } from '~/entities/task';
import { TASKS_FILTER_URL_PARAM } from '~/shared/constants';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/shared/ui';

type Filters = Record<
  string,
  { value: NonNullable<TasksFilterByUrlParam> | 'all'; label: string }
>;

const FILTERS = {
  ALL: { value: 'all', label: 'All' },
  COMPLETED: { value: 'completed', label: 'Completed only' },
} satisfies Filters;

function TasksFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterByParam = searchParams.get(TASKS_FILTER_URL_PARAM);
  const [filterBy, setFilterBy] = useState(filterByParam || FILTERS.ALL.value);
  const selected = Object.values(FILTERS).find((o) => o.value === filterBy);

  useEffect(() => {
    setFilterBy(filterByParam || FILTERS.ALL.value);
  }, [filterByParam]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">{`Show: ${selected?.label}`}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={filterBy}
          onValueChange={(value) => {
            if (value === FILTERS.ALL.value) {
              searchParams.delete(TASKS_FILTER_URL_PARAM);
              setSearchParams(searchParams);
            } else {
              searchParams.set(TASKS_FILTER_URL_PARAM, value);
              setSearchParams(searchParams);
            }
          }}
        >
          <DropdownMenuRadioItem value={FILTERS.ALL.value}>
            {FILTERS.ALL.label}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={FILTERS.COMPLETED.value}>
            {FILTERS.COMPLETED.label}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TasksFilter;
