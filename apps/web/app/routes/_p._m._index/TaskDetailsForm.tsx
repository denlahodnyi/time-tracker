import { UPDATE_TASK_ACTION } from '~/features/tasks/update-task';
import { useEnhancedFetcher, useFormErrors } from '~/shared/lib';
import { Button, TextField } from '~/shared/ui';
import type action from './action.server';

interface TaskDetailsFormProps {
  taskId: number;
  defaultValues: {
    name: string;
    description?: string;
  };
  onUpdated: () => void;
  onCancel: () => void;
}

function TaskDetailsForm(props: TaskDetailsFormProps) {
  const { defaultValues, onCancel, onUpdated, taskId } = props;
  const fetcher = useEnhancedFetcher<typeof action>({
    key: UPDATE_TASK_ACTION,
    checkSuccess: (data) => Boolean(data.data?.task),
    onSuccess: () => {
      onUpdated();
    },
  });
  const fetcherData = fetcher.data;
  const isLoading = fetcher.state !== 'idle';
  const errors = useFormErrors(fetcherData?.errors, ['name', 'description']);

  return (
    <fetcher.Form
      className="space-y-2"
      method="post"
      onSubmit={(e) => {
        if (isLoading) e.preventDefault();
      }}
    >
      <input name="taskId" type="hidden" value={taskId || ''} />
      <div>
        <TextField
          required
          autoComplete="off"
          defaultValue={defaultValues.name}
          error={errors.name?.[0]}
          label="Name"
          name="name"
        />
      </div>
      <div>
        <TextField
          defaultValue={defaultValues.description || ''}
          error={errors.description?.[0]}
          inputVariant="textarea"
          label="Description"
          name="description"
        />
      </div>
      <div className="!mt-4 flex gap-2">
        <Button
          aria-disabled={isLoading}
          isLoading={isLoading}
          name="_action"
          type="submit"
          value={UPDATE_TASK_ACTION}
        >
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </fetcher.Form>
  );
}

export default TaskDetailsForm;
