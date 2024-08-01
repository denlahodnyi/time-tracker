import type { FormErrors } from '../api';

export default function getFormError(formErrors: FormErrors, keyPath: string) {
  const keys = keyPath.split('.');
  let object = formErrors;
  let messages: string[] | null = null;

  for (const key of keys) {
    if (Object.hasOwn(object, key)) {
      const fieldObj = object[key as keyof FormErrors] as FormErrors;

      messages = fieldObj?._errors || null;
      object = fieldObj;
    } else {
      messages = null;
      break;
    }
  }

  return messages;
}
