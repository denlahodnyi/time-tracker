import { useFetcher, useNavigate } from '@remix-run/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { userApi } from '~/entities/user';
import { useFormErrors } from '~/shared/lib';
import { Button, Heading, TextField, useErrorAlert } from '~/shared/ui';
import action from './action.server';

export { action };

export default function SignUpPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fetcher = useFetcher<typeof action>();
  const actionData = fetcher.data;
  const formErrors = actionData?.errors;
  const confirmedPasswordInputRef = useRef<HTMLInputElement>(null);

  const errors = useFormErrors(formErrors, [
    'firstName',
    'email',
    'password',
    'confirmedPassword',
  ]);

  useErrorAlert(
    !formErrors && fetcher.state === 'idle' ? actionData?.error : null,
  );

  useEffect(() => {
    if (actionData?.data?.user) {
      queryClient.setQueryData(
        userApi.queries.users.me.queryKey,
        actionData.data.user,
      );
      navigate('/', { replace: true });
    }
  }, [actionData?.data?.user]);

  return (
    <div className="grid min-h-screen place-content-center">
      <div className="w-64">
        <Heading className="mb-5 text-center">Sign Up</Heading>
        <fetcher.Form
          method="post"
          className="space-y-3"
          onSubmit={(e) => {
            const data = Object.fromEntries(new FormData(e.currentTarget));

            if (data.password !== data.confirmedPassword) {
              confirmedPasswordInputRef.current?.setCustomValidity(
                "Passwords don't match",
              );
              confirmedPasswordInputRef.current?.reportValidity();

              e.preventDefault();
              // return;
            } else {
              fetcher.submit(e.currentTarget);
            }
          }}
        >
          <div>
            <TextField
              label="First name"
              required
              name="firstName"
              error={errors.firstName && errors.firstName[0]}
            />
          </div>
          <div>
            <TextField
              label="Email"
              required
              name="email"
              type="email"
              error={errors.email && errors.email[0]}
            />
          </div>
          <div>
            <TextField
              inputVariant="password"
              label="Password"
              required
              name="password"
              error={errors.password && errors.password[0]}
            />
          </div>
          <div>
            <TextField
              ref={confirmedPasswordInputRef}
              inputVariant="password"
              label="Repeat password"
              required
              name="confirmedPassword"
              error={errors.confirmedPassword && errors.confirmedPassword[0]}
              onChange={(e) => {
                e.currentTarget.setCustomValidity('');
              }}
            />
          </div>
          <Button
            type="submit"
            className="mx-auto"
            isLoading={fetcher.state !== 'idle'}
            aria-disabled={fetcher.state !== 'idle'}
          >
            Register
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}
