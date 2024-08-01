import type { ShouldRevalidateFunctionArgs } from '@remix-run/react';

export default function shouldRevalidate({
  formData,
}: ShouldRevalidateFunctionArgs) {
  if (formData) {
    const data = Object.fromEntries(formData);

    return data._action === 'updateUser';
  }

  return false;
}
