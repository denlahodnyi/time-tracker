import { useMemo } from 'react';

import getFormError from './getFormError';
import type { FormErrors } from '../api';

export default function useFormErrors(
  errors: FormErrors | null | undefined,
  keyPaths: string[],
) {
  return useMemo(
    () =>
      errors
        ? keyPaths.reduce<Record<string, string[] | null>>((prev, keyPath) => {
            const messages = getFormError(errors, keyPath);
            const field = keyPath.split('.').at(-1) as string;

            prev[field] = messages;

            return prev;
          }, {})
        : {},
    [errors, keyPaths],
  );
}
