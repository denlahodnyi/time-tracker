import { useFetcher, useNavigate, useSearchParams } from '@remix-run/react';
import debounce from 'lodash/debounce';
import { XIcon } from 'lucide-react';
import { useRef, useState } from 'react';

import type loader from '~/routes/resources.search/loader.server';
import {
  TASK_SEARCH_URL_PARAM,
  TASKS_FILTER_URL_PARAM,
} from '~/shared/constants';
import { cn } from '~/shared/lib';
import {
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/shared/ui';

export default function TasksSearchForm() {
  const fetcher = useFetcher<typeof loader>();
  const suggestions = fetcher.data?.data ? fetcher.data.data.suggestions : [];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filterParam = searchParams.get(TASKS_FILTER_URL_PARAM);

  const submitWithDebounce = useRef(
    debounce((data: HTMLFormElement) => {
      fetcher.submit(data);
    }, 300),
  );

  const clearUrlParam = () => {
    if (searchParams.has(TASK_SEARCH_URL_PARAM)) {
      searchParams.delete(TASK_SEARCH_URL_PARAM);
      setSearchParams(searchParams);
    }
  };

  return (
    <Command
      className="overflow-visible"
      label="Search task by name"
      shouldFilter={false}
    >
      <fetcher.Form ref={formRef} action="/resources/search" method="get">
        <input
          name={TASKS_FILTER_URL_PARAM}
          type="hidden"
          value={filterParam || ''}
        />
        <CommandInput
          ref={inputRef}
          name="name"
          placeholder="Your task name is..."
          value={value}
          rightElement={
            <Button
              aria-label="Clear"
              className={cn('h-10 w-10 rounded-full p-2', !value && 'hidden')}
              variant="ghost"
              onClick={() => {
                setValue('');
                clearUrlParam();
              }}
            >
              <XIcon />
            </Button>
          }
          onBlur={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onValueChange={(value) => {
            setValue(value);

            if (!value) clearUrlParam();
            if (formRef.current) {
              submitWithDebounce.current(formRef.current);
            }
          }}
        />
      </fetcher.Form>
      <div className="relative">
        <CommandList>
          {isOpen && (
            <div className="absolute top-0 z-50 w-full rounded-b-md bg-card shadow-lg">
              <CommandEmpty className="text-card-foreground">
                No task found
              </CommandEmpty>
              {suggestions.map((sug) => (
                <CommandItem
                  key={sug.id}
                  className="text-card-foreground"
                  value={sug.id.toString()}
                  onMouseDown={(e) => {
                    // Prevent blur before click starts
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={(id) => {
                    setValue(sug.name);
                    navigate(
                      `/?${TASK_SEARCH_URL_PARAM}=${id}${
                        searchParams.has(TASKS_FILTER_URL_PARAM)
                          ? `&${TASKS_FILTER_URL_PARAM}=${searchParams.get(TASKS_FILTER_URL_PARAM)}`
                          : ''
                      }`,
                    );

                    if (inputRef.current) inputRef.current.blur();
                  }}
                >
                  {sug.name}
                </CommandItem>
              ))}
            </div>
          )}
        </CommandList>
      </div>
    </Command>
  );
}
