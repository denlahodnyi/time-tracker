import type { ShouldRevalidateFunctionArgs } from '@remix-run/react';

import { parseFormData } from '~/shared/lib';

export default function shouldRevalidate({
  formData,
}: ShouldRevalidateFunctionArgs) {
  if (formData) {
    const data = parseFormData<{ _action?: string }>(formData);

    return data._action === 'updateUser';
  }

  return false;
}
