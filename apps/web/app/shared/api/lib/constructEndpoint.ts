import type { Routes } from '../utility-types';

export default function constructEndpoint<
  TRoute extends keyof Routes,
  TParts extends Routes[TRoute],
>(
  ...args: TParts extends { params: Record<string, unknown> }
    ? [endpoint: TRoute, parts: TParts]
    : [endpoint: TRoute, parts?: TParts]
): string {
  const [endpoint, parts] = args;
  let url = endpoint as string;

  if (parts && 'params' in parts) {
    for (const param in parts.params) {
      if (
        Object.prototype.hasOwnProperty.call(parts.params, param) &&
        parts.params[param as keyof typeof parts.params]
      ) {
        const paramValue = String(
          parts.params[param as keyof typeof parts.params],
        );

        url = url.replace(`:${param}`, paramValue);
      }
    }
  }
  if (parts && 'query' in parts) {
    let query = '';

    for (const queryKey in parts.query) {
      if (
        Object.prototype.hasOwnProperty.call(parts.query, queryKey) &&
        parts.query[queryKey]
      ) {
        const queryValue = String(parts.query[queryKey]);

        query += `${query ? '&' : ''}${queryKey}=${queryValue}`;
      }
    }

    if (query) url += `?${query}`;
  }

  return url;
}
