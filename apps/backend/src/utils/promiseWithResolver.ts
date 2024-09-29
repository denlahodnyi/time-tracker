export default function promiseWithResolver<TValue>() {
  let resolve: (v: TValue) => void = () => null;
  let reject: (v: unknown) => void = () => null;
  const promise = new Promise<TValue>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { resolve, reject, promise };
}
