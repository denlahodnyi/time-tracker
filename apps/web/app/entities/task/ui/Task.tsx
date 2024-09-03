import { PlayIcon, PauseIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn, msToDuration } from '~/shared/lib';
import { Button, Card, type ButtonProps, type CardProps } from '~/shared/ui';
import { taskLib } from '..';

export interface TaskCardProps extends CardProps {
  children: React.ReactNode;
}

export interface TimeSpentProps {
  totalTimeSpent: number;
}

export interface ProgressButtonProps extends ButtonProps {
  isInProgress: boolean;
  isLoading?: boolean;
}

interface TaskTimerProps extends React.HTMLAttributes<HTMLParagraphElement> {
  startDate?: Date;
  totalTimeSpent: number;
}

function TaskCard({ children, className, ...props }: TaskCardProps) {
  return (
    <Card
      data-component="task"
      className={cn(
        'grid h-20 grid-cols-2 items-center rounded-md border-[1px] border-border px-3 py-2 transition-shadow duration-300 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

function TimeSpent({ totalTimeSpent, ...props }: TimeSpentProps) {
  return <p {...props}>{taskLib.formatTotalTimeSpent(totalTimeSpent)}</p>;
}

const calcSpentTime = (start: Date, msSpent: number) => {
  const {
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = msToDuration(Date.now() - (start.getTime() - msSpent));

  const hoursStr = hours >= 10 ? hours : `0${hours}`;
  const minutesStr = minutes >= 10 ? minutes : `0${minutes}`;
  const secondsStr = seconds >= 10 ? seconds : `0${seconds}`;

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
};

function TaskTimer({ startDate, totalTimeSpent, ...props }: TaskTimerProps) {
  const [start] = useState(() => startDate ?? new Date());
  const [timer, setTimer] = useState(() =>
    calcSpentTime(start, totalTimeSpent),
  );

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimer(calcSpentTime(start, totalTimeSpent));
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [start, totalTimeSpent]);

  return <p {...props}>{timer}</p>;
}

function MainAction({
  isLoading,
  isInProgress,
  ...props
}: ProgressButtonProps) {
  return (
    <Button
      aria-disabled={isLoading}
      aria-label={isInProgress ? 'Pause task' : 'Start task'}
      className="group/button w-10 rounded-full px-0 py-0"
      isLoading={isLoading}
      loadingDelay={0}
      loadingMinDuration={1000}
      title={isInProgress ? 'Pause task' : 'Start task'}
      variant="outline"
      {...props}
    >
      {isInProgress ? (
        <PauseIcon
          className="group-data-[loading=true]/button:hidden"
          size={20}
        />
      ) : (
        <PlayIcon
          className="group-data-[loading=true]/button:hidden"
          size={20}
        />
      )}
    </Button>
  );
}

export { MainAction, TaskCard, TimeSpent, TaskTimer };
