import { msToDuration } from '~/shared/lib';

export default function formatTotalTimeSpent(timeInMs: number) {
  const {
    years,
    months,
    days,
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = msToDuration(timeInMs);

  if (years && years > 0) {
    const isPlural = years > 1;

    return `> ${years} year${isPlural ? 's' : ''}`;
  }
  if (months && months > 0) {
    const isPlural = months > 1;

    return `> ${months} month${isPlural ? 's' : ''}`;
  }
  if (days && days > 0) {
    const isPlural = days > 1;

    return `> ${days} day${isPlural ? 's' : ''}`;
  }

  const hoursStr = hours >= 10 ? hours : `0${hours}`;
  const minutesStr = minutes >= 10 ? minutes : `0${minutes}`;
  const secondsStr = seconds >= 10 ? seconds : `0${seconds}`;

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}
