// import type { ClientActionFunctionArgs } from '@remix-run/react';
// import type action from './action.server';
// import { parseRequestFormData } from '~/shared/lib';
// import type { ActionFormData } from './action.server';

// export default async function clientAction({ serverAction, request }: ClientActionFunctionArgs) {
//   const formData = await parseRequestFormData(request) as unknown as ActionFormData
//   const data = await serverAction<typeof action>();

//   if (formData._action === 'createAndStartTask' && data?.data?.task) {
//     queryClient;
//   }

//   return data;
// }
