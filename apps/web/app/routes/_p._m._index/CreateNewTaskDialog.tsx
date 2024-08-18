import { useFetcher } from '@remix-run/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { taskApi, type TaskBase } from '~/entities/task';
import { useFormErrors } from '~/shared/lib';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  TextField,
  Button,
  useErrorAlert,
} from '~/shared/ui';
import type action from './action.server';

interface TaskDetailsDialogProps {
  children: React.ReactNode;
}

function CreateNewTaskDialog(props: TaskDetailsDialogProps) {
  const { children } = props;
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [fetcherKey, setFetcherKey] = useState('');
  const fetcher = useFetcher<typeof action>({
    key: fetcherKey || 'CreateNewTaskDialog',
  });
  const isLoading = fetcher.state !== 'idle';
  const fetcherAction = fetcher.data?.data && fetcher.data._action;
  const { data: successData, error, errors } = fetcher.data || {};
  const createdTask = successData?.task;
  const formErrors = useFormErrors(errors, ['name', 'description']);

  useErrorAlert(fetcher.state === 'idle' && !errors ? error : null);

  useEffect(() => {
    if (fetcherAction === 'createTask' && createdTask) {
      setFetcherKey(`CreateNewTaskDialog_${Date.now()}`);
      setIsOpen(false);

      queryClient.setQueryData(
        taskApi.queries.tasks.myAll.queryKey,
        (prev: { tasks: TaskBase[] }) => {
          return { ...prev, tasks: [createdTask, ...prev.tasks] };
        },
      );
    }
  }, [createdTask, fetcherAction, queryClient]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task details</DialogTitle>
        </DialogHeader>
        <fetcher.Form action="/?index" className="space-y-2" method="post">
          <div>
            <TextField
              required
              autoComplete="off"
              error={formErrors.name?.[0]}
              label="Name"
              name="name"
            />
          </div>
          <div>
            <TextField
              error={formErrors.description?.[0]}
              inputVariant="textarea"
              label="Description"
              name="description"
            />
          </div>
          <DialogFooter className="!mt-4">
            <Button
              aria-disabled={isLoading}
              isLoading={isLoading}
              name="_action"
              type="submit"
              value="createTask"
            >
              Create
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateNewTaskDialog;
