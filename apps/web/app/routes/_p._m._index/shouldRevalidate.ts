import type { ShouldRevalidateFunctionArgs } from '@remix-run/react';

export default function shouldRevalidate({
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return defaultShouldRevalidate;
}
