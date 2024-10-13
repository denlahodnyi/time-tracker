import { randTodo, randTextRange } from '@ngneat/falso';
import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages';
import { prisma } from '../prisma';

interface TaskDetails {
  name: string;
  description: string;
}

interface TasksFixture {
  homePage: HomePage;
  createdTask: TaskDetails;
  randomTaskDetails: TaskDetails;
  credentials: {
    email: string;
    password: string;
  };
  deleteTaskFromDB: (name: string) => Promise<unknown>;
}

const deleteTask = async (name: string) => {
  const delTasks = await prisma.task.deleteMany({
    where: { name },
  });
  console.log(`tasks.fixture: successfully deleted ${delTasks.count} tasks`);
  return delTasks;
};

export const test = base.extend<TasksFixture>({
  credentials: [{ email: '', password: '' }, { option: true }],
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  // eslint-disable-next-line no-empty-pattern
  randomTaskDetails: ({}, use) => {
    const { title: name } = randTodo();
    const description = randTextRange({ min: 10, max: 100 });

    use({ name, description });
  },
  // eslint-disable-next-line no-empty-pattern
  deleteTaskFromDB: ({}, use) => {
    use(deleteTask);
  },
  createdTask: async (
    { homePage, randomTaskDetails, credentials, deleteTaskFromDB },
    use
  ) => {
    if (!credentials.email || !credentials.password) {
      throw new Error('Provide credentials');
    }
    const { name, description } = randomTaskDetails;

    await homePage.loginAndGoto(credentials.email, credentials.password);
    await homePage.addNewTask(name, description);

    const task = homePage.getTaskLocator(name);

    await expect(task).toHaveCount(1);
    await expect(task).toBeVisible();

    await use({ name, description });
    await deleteTaskFromDB(name);
  },
});
