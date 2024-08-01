import { useFetcher } from '@remix-run/react';

import { userApi } from '~/entities/user';
import { useFormErrors } from '~/shared/lib';
import { Button, TextField, useSuccessAlert } from '~/shared/ui';
import action from './action.server';

function UserProfileForm() {
  const fetcher = useFetcher<typeof action>();
  const formErrors = fetcher.data?.errors;
  const { data } = userApi.useCurrentUser();
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
    <fetcher.Form action="/profile" method="POST" className="space-y-2">
      <div>
        <TextField
          id="firstName"
          name="firstName"
          label="First name"
          required
          defaultValue={data?.firstName}
          error={errors.firstName && errors.firstName[0]}
        />
      </div>
      <div>
        <TextField
          id="lastName"
          name="lastName"
          label="Last name"
          required
          defaultValue={data?.lastName || ''}
          error={errors.lastName && errors.lastName[0]}
        />
      </div>
      <div>
        <TextField
          id="email"
          name="email"
          label="Email"
          required
          defaultValue={data?.email || ''}
          error={errors.email && errors.email[0]}
        />
      </div>
      <div>
        <TextField
          id="bio"
          name="bio"
          label="Bio"
          required
          defaultValue={data?.bio || ''}
          error={errors.bio && errors.bio[0]}
          inputVariant="textarea"
        />
      </div>
      <Button
        type="submit"
        name="_action"
        value="updateUser"
        className="!mt-5"
        aria-disabled={fetcher.state !== 'idle'}
        isLoading={fetcher.state !== 'idle'}
        loadingDelay={0}
        loadingMinDuration={1000}
      >
        Update
      </Button>
    </fetcher.Form>
  );
}

export default UserProfileForm;
