import { useQueryClient } from '@tanstack/react-query';
import { PenIcon } from 'lucide-react';
import { useState } from 'react';

import {
  taskApi,
  type AllTasksQueryData,
  type TaskBase,
} from '~/entities/task';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/shared/ui';
import TaskDetailsForm from './TaskDetailsForm';

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: TaskBase['id'];
}

function TaskDetailsDialog(props: TaskDetailsDialogProps) {
  const { open, onOpenChange, taskId } = props;
  const queryClient = useQueryClient();
  const [isEdit, setIsEdit] = useState(false);

  let task: TaskBase | undefined;

  queryClient
    .getQueryData<AllTasksQueryData>(taskApi.queries.tasks.myAll.queryKey)
    ?.pages.find((page) => {
      task = page.tasks.find((t) => t.id === taskId);

      return !!task;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="flex flex-row items-baseline gap-3">
            <DialogTitle>Task details</DialogTitle>
            {!isEdit && (
              <Button
                aria-label="Edit task"
                className="h-auto w-auto rounded-full p-1"
                title="Edit task"
                variant="ghost"
                onClick={() => setIsEdit(true)}
              >
                <PenIcon className="h-4 w-4" />
              </Button>
            )}
          </span>
        </DialogHeader>
        {isEdit && task?.id ? (
          <TaskDetailsForm
            taskId={task.id}
            defaultValues={{
              name: task?.name || '',
              description: task?.description || '',
            }}
            onCancel={() => setIsEdit(false)}
            onUpdated={() => setIsEdit(false)}
          />
        ) : (
          <div className="[&_p:not(:empty)]:mb-2">
            <h3 className="text-slate-600">Name</h3>
            <p>{task?.name || ''}</p>
            <h3 className="text-slate-600">Description</h3>
            <p>{task?.description || ''}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetailsDialog;
