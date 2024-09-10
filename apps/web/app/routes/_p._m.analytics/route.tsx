import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import truncate from 'lodash/truncate';
import { useCallback, useMemo } from 'react';
import { Bar, BarChart } from 'recharts';

import { formatTotalTimeSpent } from '~/entities/task/lib';
import { getAnalytics } from '~/features/tasks/analytics/server';
import { msToDuration } from '~/shared/lib';
import {
  handleRequestError,
  requireAuthRequest,
} from '~/shared/lib/server-only';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Heading,
  type ChartConfig,
} from '~/shared/ui';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    requireAuthRequest(request);

    const { data, setCookie } = await getAnalytics(request);

    return json(data, {
      headers: {
        'Set-Cookie': setCookie,
      },
    });
  } catch (err) {
    handleRequestError(err, request, { shouldThrowError: true });
  }
}

export default function AnalyticsPage() {
  const loaderData = useLoaderData<typeof loader>();

  const topLongestChartConfig = useMemo(() => {
    return {
      totalTimeSpent: {
        label: 'Time spent',
      },
      ...loaderData.topLongest.reduce<Record<number, { label: string }>>(
        (acc, task) => {
          acc[task.taskId] = { label: truncate(task.name, { length: 26 }) };

          return acc;
        },
        {},
      ),
    } satisfies ChartConfig;
  }, [loaderData.topLongest]);

  const topShortestChartConfig = useMemo(() => {
    return {
      totalTimeSpent: {
        label: 'Time spent',
      },
      ...loaderData.topShortest.reduce<Record<number, { label: string }>>(
        (acc, task) => {
          acc[task.taskId] = { label: truncate(task.name, { length: 26 }) };

          return acc;
        },
        {},
      ),
    } satisfies ChartConfig;
  }, [loaderData.topShortest]);

  const toolTipValueFormatter = useCallback(
    (value: unknown) =>
      formatTotalTimeSpent(typeof value === 'number' ? value : Number(value)),
    [],
  );

  return (
    <div className="px-3 py-4 md:px-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-sm border border-border p-4 py-5 text-center">
          <p className="text-xl md:text-3xl">
            You have <b>{loaderData.totalTasks}</b> tasks
          </p>
        </div>
        <div className="rounded-sm border border-border p-4 py-5 text-center">
          <p className="text-xl md:text-3xl">
            {loaderData.todayTotalTimeSpent ? (
              <span>
                <b>{formatTimeSpentToday(loaderData.todayTotalTimeSpent)}</b>{' '}
                spent today
              </span>
            ) : (
              'No tasks were active today'
            )}
          </p>
        </div>
        <div className="rounded-sm border border-border p-4 py-5 text-center">
          <p className="text-xl md:text-3xl">
            {loaderData.weekTotalTimeSpent ? (
              <span>
                <b>{formatTimeSpentForWeek(loaderData.weekTotalTimeSpent)}</b>{' '}
                spent this week
              </span>
            ) : (
              'There is no progress for this week'
            )}
          </p>
        </div>
        <div className="rounded-sm border border-border p-4 py-5 text-center">
          <p className="text-xl md:text-3xl">
            <b>{formatAvgTime(loaderData.totalAvgTimeSpent)}</b> Avg
          </p>
        </div>
        <div className="rounded-sm border border-border p-4 py-5">
          <Heading as="h2" className="text-center text-xl">
            Top 5 longest tasks
          </Heading>
          <p className="mb-3 text-center text-muted-foreground">
            (Hover to see details)
          </p>
          {loaderData.topLongest.length ? (
            <ChartContainer config={topLongestChartConfig}>
              <BarChart
                accessibilityLayer
                data={loaderData.topLongest}
                layout="horizontal"
              >
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      indicator="dot"
                      labelKey="totalTimeSpent"
                      nameKey="taskId"
                      valueFormatter={toolTipValueFormatter}
                    />
                  }
                />
                <Bar dataKey="totalTimeSpent" radius={10} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-center">No data yet</p>
          )}
        </div>
        <div className="rounded-sm border border-border p-4 py-5">
          <Heading as="h2" className="text-center text-xl">
            Top 5 shortest tasks
          </Heading>
          <p className="mb-3 text-center text-muted-foreground">
            (Hover to see details)
          </p>
          {loaderData.topShortest.length ? (
            <ChartContainer config={topShortestChartConfig}>
              <BarChart
                accessibilityLayer
                data={loaderData.topShortest}
                layout="horizontal"
              >
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      indicator="dot"
                      labelKey="totalTimeSpent"
                      nameKey="taskId"
                      valueFormatter={toolTipValueFormatter}
                    />
                  }
                />
                <Bar dataKey="totalTimeSpent" radius={10} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-center">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

const formatTimeSpentToday = (ms: number) => {
  return formatTotalTimeSpent(ms);
};

const formatTimeSpentForWeek = (ms: number) => {
  return formatTotalTimeSpent(ms);
};

const formatAvgTime = (ms: number) => {
  if (!ms) return 0;

  const { years, months, hours, minutes } = msToDuration(ms);

  if (years) return `${years} year${years > 1 ? 's' : ''}`;
  if (months) return `${months} month${months > 1 ? 's' : ''}`;
  if (hours) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes) return `${minutes} minute${minutes > 1 ? 's' : ''}`;

  return `Less than a minute`;
};