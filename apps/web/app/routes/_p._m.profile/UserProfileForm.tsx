import { useFetcher, useRouteLoaderData } from '@remix-run/react';

import { useFormErrors } from '~/shared/lib';
import { Button, TextField, useSuccessAlert } from '~/shared/ui';
import action from './action.server';
import type loader from '../_p/loader.server';

function UserProfileForm() {
  const fetcher = useFetcher<typeof action>();
  const formErrors = fetcher.data?.errors;
  const protectedLoaderData = useRouteLoaderData<typeof loader>('routes/_p');
  const { user } = protectedLoaderData?.data || {};
  const errors = useFormErrors(formErrors, [
    'firstName',
    'lastName',
    'email',
    'bio',
  ]);

  useSuccessAlert(
    fetcher.state === 'idle' && fetcher.data?.data
      ? 'Your profile was successfully updated'
      : null,
  );

  return (
    <fetcher.Form action="/profile" className="space-y-2" method="POST">
      <div>
        <TextField
          required
          defaultValue={user?.firstName}
          error={errors.firstName && errors.firstName[0]}
          id="firstName"
          label="First name"
          name="firstName"
        />
      </div>
      <div>
        <TextField
          defaultValue={user?.lastName || ''}
          error={errors.lastName && errors.lastName[0]}
          id="lastName"
          label="Last name"
          name="lastName"
        />
      </div>
      <div>
        <TextField
          required
          defaultValue={user?.email || ''}
          error={errors.email && errors.email[0]}
          id="email"
          label="Email"
          name="email"
        />
      </div>
      <div>
        <TextField
          defaultValue={user?.bio || ''}
          error={errors.bio && errors.bio[0]}
          id="bio"
          inputVariant="textarea"
          label="Bio"
          name="bio"
        />
      </div>
      <Button
        aria-disabled={fetcher.state !== 'idle'}
        className="!mt-5"
        isLoading={fetcher.state !== 'idle'}
        loadingDelay={0}
        loadingMinDuration={1000}
        name="_action"
        type="submit"
        value="updateUser"
      >
        Update
      </Button>
    </fetcher.Form>
  );
}

export default UserProfileForm;
