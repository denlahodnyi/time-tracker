import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { CREATE_TASK_ACTION } from '~/features/tasks/create-task';
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
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher<typeof action>();
  const isLoading = fetcher.state !== 'idle';
  const { data: successData, error, errors } = fetcher.data || {};
  const isSuccess = Boolean(!isLoading && successData?.task);
  const formErrors = useFormErrors(errors, ['name', 'description']);

  useErrorAlert(fetcher.state === 'idle' && !errors ? error : null);

  useEffect(() => {
    if (isSuccess) setIsOpen(false);
  }, [isSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-describedby="">
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
              value={CREATE_TASK_ACTION}
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
