import { DELETE_TASK_ACTION } from '~/features/tasks/delete-task';
import { useEnhancedFetcher } from '~/shared/lib';
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  Button,
} from '~/shared/ui';

interface DeleteTaskAlertProps {
  children: React.ReactNode;
  taskId: number;
}

function DeleteTaskAlert({ children, taskId }: DeleteTaskAlertProps) {
  const fetcher = useEnhancedFetcher({ key: DELETE_TASK_ACTION });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your task
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <fetcher.Form method="post">
            <input name="taskId" type="hidden" value={taskId} />
            <AlertDialogAction asChild>
              <Button
                isLoading={fetcher.state !== 'idle'}
                name="_action"
                type="submit"
                value={DELETE_TASK_ACTION}
              >
                Continue
              </Button>
            </AlertDialogAction>
          </fetcher.Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteTaskAlert;
