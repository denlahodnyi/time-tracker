export default function leadingZeroNum(num: number) {
  return num >= 10 ? num : `0${num}`;
}
