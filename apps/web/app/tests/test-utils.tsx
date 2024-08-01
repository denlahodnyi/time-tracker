import { render, RenderOptions } from '@testing-library/react';

import { ReactQueryProvider } from '~/base/providers';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@remix-run/testing';
// eslint-disable-next-line import/export
export * from '@testing-library/react';
// eslint-disable-next-line import/export
export { customRender as render };
