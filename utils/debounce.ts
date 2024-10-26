interface DebounceSettings {
    /**
     * Specify invoking on the leading edge of the timeout.
     * @default false
     */
    leading?: boolean;
    /**
     * The maximum time func is allowed to be delayed before it’s invoked.
     * @default undefined
     */
    maxWait?: number;
    /**
     * Specify invoking on the trailing edge of the timeout.
     * @default true
     */
    trailing?: boolean;
}
interface DebounceSettingsLeading extends DebounceSettings {
    leading: true;
}
interface DebouncedFunc<T extends (...args: any[]) => any> {
    /**
     * Call the original function, but applying the debounce rules.
     *
     * If the debounced function can be run immediately, this calls it and returns its return
     * value.
     *
     * Otherwise, it returns the return value of the last invocation, or undefined if the debounced
     * function was not invoked yet.
     */
    (...args: Parameters<T>): ReturnType<T> | undefined;

    /**
     * Throw away any pending invocation of the debounced function.
     */
    cancel(): void;

    /**
     * If there is a pending invocation of the debounced function, invoke it immediately and return
     * its return value.
     *
     * Otherwise, return the value from the last invocation, or undefined if the debounced function
     * was never invoked.
     */
    flush(): ReturnType<T> | undefined;
}
interface DebouncedFuncLeading<T extends (...args: any[]) => any> extends DebouncedFunc<T> {
    (...args: Parameters<T>): ReturnType<T>;
    flush(): ReturnType<T>;
}
/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed since
 * the last time the debounced function was invoked. The debounced function comes with a cancel method to
 * cancel delayed invocations and a flush method to immediately invoke them. Provide an options object to
 * indicate that func should be invoked on the leading and/or trailing edge of the wait timeout. Subsequent
 * calls to the debounced function return the result of the last func invocation.
 *
 * Note: If leading and trailing options are true, func is invoked on the trailing edge of the timeout only
 * if the the debounced function is invoked more than once during the wait timeout.
 *
 * See David Corbacho’s article for details over the differences between _.debounce and _.throttle.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay. (@default: 200)
 * @param opts The options object.
 * @return Returns the new debounced function.
 */
export function debounce<T extends (...args: any) => any>(func: T, waitMS?: number, opts?: DebounceSettings): DebouncedFunc<T>;
export function debounce<T extends (...args: any) => any>(func: T, waitMS: number | undefined, opts: DebounceSettingsLeading): DebouncedFuncLeading<T>;
export function debounce<T extends (...args: any) => any>(func: T, waitMS?: number, opts?: DebounceSettings): DebouncedFunc<T> {
    const wait = waitMS ?? 200;
    opts ??= {};

    let lastArgs: any,
        lastThis: any,
        result: any,
        timerId: any;
    let lastCallTime: number | undefined,
        lastInvokeTime = 0,
        leading = opts.leading !== undefined ? opts.leading : false,
        trailing = opts.trailing !== undefined ? opts.trailing : true,
        maxWait = (opts.maxWait && opts.maxWait > wait) ? opts.maxWait : undefined;

    function invokeFunc(time: number) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
    }

    function leadingEdge(time: number) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time: number) {
        const timeSinceLastCall = time - <number>lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            timeWaiting = wait - timeSinceLastCall;

        return maxWait
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
    }

    function shouldInvoke(time: number) {
        const timeSinceLastCall = time - <number>lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxWait && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time: number) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
    }

    function cancel() {
        if (timerId !== undefined) {
            clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
        return timerId === undefined ? result : trailingEdge(Date.now());
    }

    function debounced(this: any) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
            if (timerId === undefined) {
                return leadingEdge(lastCallTime);
            }
            if (maxWait) {
                // Handle invocations in a tight loop.
                clearTimeout(timerId);
                timerId = setTimeout(timerExpired, wait);
                return invokeFunc(lastCallTime);
            }
        }
        if (timerId === undefined) {
            timerId = setTimeout(timerExpired, wait);
        }
        return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @param func The function to throttle.
 * @param waitMS The number of milliseconds to throttle invocations to. (@default: 200)
 */
export function throttle<T extends (...args: any) => any>(func: T, waitMS?: number): DebouncedFuncLeading<T> {
    const wait = waitMS ?? 200;
    return <any>debounce(func, wait, { leading: true, maxWait: wait, trailing: true });
}
