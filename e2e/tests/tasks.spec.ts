import { expect } from '@playwright/test';
import { AuthPage } from '~/libs/pages';
import { tasksFixture } from '~/libs/fixtures';

const { test } = tasksFixture;

const EMAIL = 'den@dev.dev';
const PASSWORD = '12345';

const testWithCreds = test;
testWithCreds.use({ credentials: { email: EMAIL, password: PASSWORD } });

test('can create task', async ({
  homePage,
  randomTaskDetails,
  deleteTaskFromDB,
}) => {
  const { name, description } = randomTaskDetails;
  await homePage.loginAndGoto(EMAIL, PASSWORD);
  await homePage.addNewTask(name, description);
  const task = homePage.getTaskLocator(name);

  await expect(task).toHaveCount(1);
  await expect(task).toBeVisible();

  await deleteTaskFromDB(name);
});

test('can find task using search and show only selected one', async ({
  page,
  homePage,
  deleteTaskFromDB,
}) => {
  await homePage.loginAndGoto(EMAIL, PASSWORD);
  const name = 'New searchable task';
  await homePage.addNewTask(name);
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle');
  const task = homePage.getTaskLocator(name);

  await expect(task).toBeVisible();

  await page.getByLabel('Search task by name').fill('searchable');

  const suggestions = page.getByRole('listbox', {
    name: /suggestions/i,
  });
  await suggestions.getByRole('option', { name, exact: true }).click();

  await expect(page.getByLabel('Search task by name')).toHaveValue(name);
  await expect(page).toHaveURL(/.+?\?task_id=\d+?/);
  await expect(task).toBeVisible();
  await expect(page.getByTestId('task')).toHaveCount(1);

  await page.getByRole('button', { name: /clear/i }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByLabel('Search task by name')).toHaveValue('');
  await expect(page.getByTestId('task')).not.toHaveCount(1);

  await deleteTaskFromDB(name);
});

testWithCreds(
  'can edit task',
  async ({ page, homePage, createdTask, deleteTaskFromDB }) => {
    const { name, description } = createdTask;

    const task = homePage.getTaskLocator(name);

    await task.getByRole('button', { name: /view details/i }).click();
    const dialog = page
      .getByRole('dialog')
      .filter({ has: page.getByRole('heading', { name: /task details/i }) });
    await dialog.getByRole('button', { name: /edit task/i }).click();
    const editedName = name + ' (edited)';
    const editedDescr = description + ' (edited)';
    await dialog.getByLabel('Name').fill(editedName);
    await dialog.getByLabel('Description').fill(editedDescr);
    await dialog.getByRole('button', { name: /save/i }).click();

    const editedTask = homePage.getTaskLocator(editedName);

    await expect(dialog.getByText(editedName)).toBeVisible();
    await expect(dialog.getByText(editedDescr)).toBeVisible();

    await dialog.getByRole('button', { name: /close/i }).click();

    await expect(editedTask).toHaveCount(1);
    await expect(editedTask).toBeVisible();

    await deleteTaskFromDB(editedName);
  }
);
test('can paginate', async ({ page, homePage }) => {
  await homePage.loginAndGoto(EMAIL, PASSWORD);

  const tasks = page.getByRole('article').and(page.getByTestId('task'));
  let total = await tasks.count();

  await page.getByRole('button', { name: /load more/i }).click();
  await expect(tasks).not.toHaveCount(total);
  const page1Total = await tasks.count();
  expect(page1Total).toBeGreaterThan(total);
  total = page1Total;
  await page.getByRole('button', { name: /load more/i }).click();
  await expect(tasks).not.toHaveCount(total);
  const page2Total = await tasks.count();
  expect(page2Total).toBeGreaterThan(total);
  await expect(page.getByRole('button', { name: /load more/i })).toBeHidden();
});

testWithCreds(
  'can start and stop task',
  async ({ page, homePage, createdTask }) => {
    const { name } = createdTask;
    const task = homePage.getTaskLocator(name);

    const activeTask = page.getByTestId('active-task');

    await task.getByRole('button', { name: /start task/i }).click();
    await expect(task).toBeHidden();
    await expect(activeTask.getByText(name)).toBeVisible();
    await expect(activeTask.getByRole('timer')).toBeVisible();

    const forwardedTime = new Date();
    forwardedTime.setMinutes(forwardedTime.getMinutes() + 30);
    await page.clock.setFixedTime(forwardedTime);

    await activeTask.getByRole('button', { name: /pause task/i }).click();
    await expect(task).toBeVisible();
    await expect(task.getByText(/00:30:\d\d/)).toBeVisible();
  }
);

test('can create and start task simultaneously', async ({
  page,
  homePage,
  randomTaskDetails,
  deleteTaskFromDB,
}) => {
  await homePage.loginAndGoto(EMAIL, PASSWORD);
  const { name } = randomTaskDetails;

  const activeTask = page.getByTestId('active-task');
  await activeTask.getByLabel('Task name').fill(name);
  await activeTask.getByRole('button', { name: /start task/i }).click();

  await expect(activeTask.getByText(name)).toBeVisible();
  await expect(activeTask.getByRole('timer')).toBeVisible();

  const forwardedTime = new Date();
  forwardedTime.setMinutes(forwardedTime.getMinutes() + 30);
  await page.clock.setFixedTime(forwardedTime);

  await activeTask.getByRole('button', { name: /pause task/i }).click();

  const task = homePage.getTaskLocator(name);

  await expect(activeTask.getByLabel('Task name')).toBeVisible();
  await expect(task).toBeVisible();
  await expect(task.getByText(/00:30:\d\d/)).toBeVisible();

  await deleteTaskFromDB(name);
});

test('can see started task after logout', async ({
  page,
  homePage,
  randomTaskDetails,
  deleteTaskFromDB,
}) => {
  const authPage = new AuthPage(page);
  await homePage.loginAndGoto(EMAIL, PASSWORD);
  const { name } = randomTaskDetails;

  const activeTask = page.getByTestId('active-task');
  await activeTask.getByLabel('Task name').fill(name);
  await activeTask.getByRole('button', { name: /start task/i }).click();
  await authPage.logout();
  await homePage.loginAndGoto(EMAIL, PASSWORD);
  await expect(activeTask.getByText(name)).toBeVisible();
  await expect(activeTask.getByRole('timer')).toBeVisible();
  await activeTask.getByRole('button', { name: /pause task/i }).click();

  const task = homePage.getTaskLocator(name);

  await expect(activeTask.getByLabel('Task name')).toBeVisible();
  await expect(task).toBeVisible();

  await deleteTaskFromDB(name);
});

testWithCreds(
  'can mark task as completed',
  async ({ page, homePage, createdTask }) => {
    const { name } = createdTask;
    const task = homePage.getTaskLocator(name);
    await task
      .getByRole('button', { name: /show additional actions/i })
      .click();
    await page.getByRole('menuitem', { name: /mark as done/i }).click();
    await expect(task).toContainText(/completed/i);
    await task
      .getByRole('button', { name: /show additional actions/i })
      .click();
    await expect(
      page.getByRole('menuitem', { name: /mark as done/i })
    ).toBeDisabled();
  }
);

test('can filter by completed tasks', async ({ page, homePage }) => {
  await homePage.loginAndGoto(EMAIL, PASSWORD);
  await page.getByRole('button', { name: /Show: All/i }).click();
  await page.getByRole('menuitemradio', { name: /Completed only/i }).click();
  await expect(
    page.getByRole('button', { name: /Show: Completed only/i })
  ).toBeVisible();
  await expect(page).toHaveURL(/.+?\?filter_by=completed/);
  await expect(
    page.getByRole('article').filter({ hasText: /completed/i })
  ).toHaveCount(1);
  await expect(page.getByTestId('task')).toHaveCount(1);
  await page.getByRole('button', { name: /Show: Completed only/i }).click();
  await page.getByRole('menuitemradio', { name: /All/i }).click();
  await expect(page.getByRole('button', { name: /Show: All/i })).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('task')).not.toHaveCount(1);
});

test('can delete task', async ({ page, homePage, randomTaskDetails }) => {
  const { name } = randomTaskDetails;
  await homePage.loginAndGoto(EMAIL, PASSWORD);
  await homePage.addNewTask(name);
  const task = homePage.getTaskLocator(name);
  await task.getByRole('button', { name: /show additional actions/i }).click();
  await page.getByRole('menuitem', { name: /delete task/i }).click();
  const alertDialog = page.getByRole('alertdialog').filter({
    has: page.getByRole('heading', { name: /Are you absolutely sure?/i }),
  });
  await alertDialog.getByRole('button', { name: /continue/i }).click();
  await expect(task).toBeHidden();
});
