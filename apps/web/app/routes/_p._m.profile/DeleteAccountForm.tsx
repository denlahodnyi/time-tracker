import { useFetcher } from '@remix-run/react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '~/shared/ui';

export default function DeleteAccountForm() {
  const fetcher = useFetcher();
  const [isOpen, setIsOpen] = useState(false);
  const isDisabled = fetcher.state !== 'idle';

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="destructive"
        isLoading={isDisabled}
        aria-disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) setIsOpen(true);
        }}
      >
        Delete account
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <fetcher.Form action="/profile" method="post">
            <AlertDialogAction type="submit" name="_action" value="deleteUser">
              Continue
            </AlertDialogAction>
          </fetcher.Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
