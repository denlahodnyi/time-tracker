import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [{ title: 'Time tracker' }];
};

export default function Index() {
  return (
    <div className="px-5">
      <h1>No content yet</h1>
    </div>
  );
}
