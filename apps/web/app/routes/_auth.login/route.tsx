import { Link, useFetcher, useLocation, useNavigate } from '@remix-run/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { userApi } from '~/entities/user';
import { useFormErrors } from '~/shared/lib';
import { Button, Heading, useErrorAlert, TextField } from '~/shared/ui';
import action from './action.server';

export { action };

export default function LoginPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const fetcher = useFetcher<typeof action>();
  const actionData = fetcher.data;
  const formErrors = actionData?.errors;

  useErrorAlert(
    !formErrors && fetcher.state === 'idle' ? actionData?.error : null,
  );

  const errors = useFormErrors(formErrors, ['email', 'password']);

  useEffect(() => {
    if (actionData?.data?.user) {
      const searchParams = new URLSearchParams(location.search);
      const nextPath = searchParams.get('nextPath');
      const nextHash = searchParams.get('nextHash');
      const hash = nextHash ? `#${nextHash}` : '';

      queryClient.setQueryData(
        userApi.queries.users.me.queryKey,
        actionData.data.user,
      );
      navigate(nextPath ? `${nextPath}${hash}` : '/', { replace: true });
    }
  }, [actionData?.data?.user]);

  return (
    <div className="grid min-h-screen place-content-center">
      <div className="w-64">
        <Heading className="mb-5 text-center">Sign In</Heading>
        <fetcher.Form method="post" className="space-y-3">
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
          <Button
            type="submit"
            className="mx-auto"
            isLoading={fetcher.state !== 'idle'}
            aria-disabled={fetcher.state !== 'idle'}
          >
            Login
          </Button>
        </fetcher.Form>
        <div className="mt-4 border-t border-slate-300 pt-2 text-center">
          <p>Doesn&apos;t have an account yet?</p>
          <Button variant="link" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
