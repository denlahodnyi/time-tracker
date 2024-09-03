import { createCookie } from '@remix-run/node';

export const createTaskCountCookie = createCookie('create-task', {
  httpOnly: true,
});

export const taskDeleteCounterCookie = createCookie('delete-task', {
  httpOnly: true,
});

export const tasksLoadCounterCookie = createCookie('get-user-tasks', {
  httpOnly: true,
});

export const startTaskCountCookie = createCookie('start-task', {
  httpOnly: true,
});

export const stopTaskCountCookie = createCookie('stop-task', {
  httpOnly: true,
});

export const taskUpdateCounterCookie = createCookie('update-task', {
  httpOnly: true,
});
