import type { ShouldRevalidateFunctionArgs } from '@remix-run/react';

import {
  DELETE_AVATAR_ACTION,
  UPLOAD_AVATAR_ACTION,
} from '~/features/user/upload-avatar';
import { parseFormData } from '~/shared/lib';

export default function shouldRevalidate({
  formData,
}: ShouldRevalidateFunctionArgs) {
  if (formData) {
    const data = parseFormData<{ _action?: string }>(formData);

    return (
      data._action === 'updateUser' ||
      data._action === UPLOAD_AVATAR_ACTION ||
      data._action === DELETE_AVATAR_ACTION
    );
  }

  return false;
}
