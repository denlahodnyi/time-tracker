import { intervalToDuration } from 'date-fns';

export default function msToDuration(epochMs: number) {
  return intervalToDuration({ start: new Date(0), end: new Date(epochMs) });
}
