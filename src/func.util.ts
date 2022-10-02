export function doItOnce(
  timeoutInMillis: number,
  fn: (..._args) => any,
  ...args: any[]
) {
  return new Promise((res, rej) => {
    const looper = setTimeout(() => {
      clearTimeout(looper);
      res(fn(args));
    }, timeoutInMillis);
  });
}
