type DebouncedFunction<T extends (...args: never[]) => unknown> = ((
  ...args: Parameters<T>
) => void) & {
  cancel: () => void;
};

export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  waitMs: number,
  options: { leading?: boolean; trailing?: boolean } = {},
): DebouncedFunction<T> {
  const { leading = false, trailing = true } = options;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let invoked = false;

  const invoke = () => {
    if (!lastArgs) return;
    fn(...lastArgs);
    lastArgs = undefined;
    invoked = true;
  };

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args;

    if (leading && !timeoutId && !invoked) {
      invoke();
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      invoked = false;

      if (trailing && lastArgs) {
        invoke();
      }
    }, waitMs);
  }) as DebouncedFunction<T>;

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    lastArgs = undefined;
    invoked = false;
  };

  return debounced;
}
