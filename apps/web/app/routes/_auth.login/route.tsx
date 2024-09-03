import { Link, useFetcher, useLocation, useNavigate } from '@remix-run/react';
import { useEffect } from 'react';

import { useFormErrors } from '~/shared/lib';
import { Button, Heading, useErrorAlert, TextField } from '~/shared/ui';
import action from './action.server';

export { action };

export default function LoginPage() {
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

      navigate(nextPath ? `${nextPath}${hash}` : '/', { replace: true });
    }
  }, [actionData?.data?.user]);

  return (
    <div className="grid min-h-screen place-content-center">
      <div className="w-64">
        <Heading className="mb-5 text-center">Sign In</Heading>
        <fetcher.Form className="space-y-3" method="post">
          <div>
            <TextField
              required
              error={errors.email && errors.email[0]}
              label="Email"
              name="email"
              type="email"
            />
          </div>
          <div>
            <TextField
              required
              error={errors.password && errors.password[0]}
              inputVariant="password"
              label="Password"
              name="password"
            />
          </div>
          <Button
            aria-disabled={fetcher.state !== 'idle'}
            className="mx-auto"
            isLoading={fetcher.state !== 'idle'}
            type="submit"
          >
            Login
          </Button>
        </fetcher.Form>
        <div className="mt-4 border-t border-slate-300 pt-2 text-center">
          <p>Doesn&apos;t have an account yet?</p>
          <Button asChild variant="link">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
