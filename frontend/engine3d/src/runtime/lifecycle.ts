/** Owns asynchronous browser resources for one engine instance. */
export class EngineLifecycle {
  disposed = false;
  private timeouts = new Set<ReturnType<typeof globalThis.setTimeout>>();
  private intervals = new Set<ReturnType<typeof globalThis.setInterval>>();
  private frames = new Set<number>();
  private listeners: {
    target: EventTarget;
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  }[] = [];
  readonly workers = new Set<Worker>();
  readonly setTimeout = (
    callback: (...args: unknown[]) => void,
    delay?: number,
    ...args: unknown[]
  ) => {
    if (this.disposed) return 0;
    const handle = globalThis.setTimeout(() => {
      this.timeouts.delete(handle);
      if (!this.disposed) callback(...args);
    }, delay);
    this.timeouts.add(handle);
    return handle;
  };
  readonly clearTimeout = (handle: ReturnType<typeof globalThis.setTimeout>) => {
    this.timeouts.delete(handle);
    globalThis.clearTimeout(handle);
  };
  readonly setInterval = (
    callback: (...args: unknown[]) => void,
    delay?: number,
    ...args: unknown[]
  ) => {
    if (this.disposed) return 0;
    const handle = globalThis.setInterval(() => {
      if (!this.disposed) callback(...args);
    }, delay);
    this.intervals.add(handle);
    return handle;
  };
  readonly clearInterval = (handle: ReturnType<typeof globalThis.setInterval>) => {
    this.intervals.delete(handle);
    globalThis.clearInterval(handle);
  };
  readonly requestAnimationFrame = (callback: FrameRequestCallback) => {
    if (this.disposed) return 0;
    const handle = globalThis.requestAnimationFrame((time) => {
      this.frames.delete(handle);
      if (!this.disposed) callback(time);
    });
    this.frames.add(handle);
    return handle;
  };
  readonly cancelAnimationFrame = (handle: number) => {
    this.frames.delete(handle);
    globalThis.cancelAnimationFrame(handle);
  };
  readonly listen = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (this.disposed) return;
    target.addEventListener(type, listener, options);
    this.listeners.push({ target, type, listener, options });
  };
  readonly unlisten = (
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) => {
    target.removeEventListener(type, listener, options);
    this.listeners = this.listeners.filter(
      (item) => !(item.target === target && item.type === type && item.listener === listener),
    );
  };
  trackWorker(worker: Worker) {
    this.workers.add(worker);
    this.listen(worker, "error", ((event: ErrorEvent) =>
      console.error("[Athena] worker failed", event.message, event.filename)) as EventListener);
    return worker;
  }
  get counts() {
    return {
      listeners: this.listeners.length,
      timeouts: this.timeouts.size,
      intervals: this.intervals.size,
      frames: this.frames.size,
      workers: this.workers.size,
    };
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    for (const handle of this.timeouts) globalThis.clearTimeout(handle);
    for (const handle of this.intervals) globalThis.clearInterval(handle);
    for (const handle of this.frames) globalThis.cancelAnimationFrame(handle);
    for (const item of this.listeners)
      item.target.removeEventListener(item.type, item.listener, item.options);
    for (const worker of this.workers) worker.terminate();
    this.timeouts.clear();
    this.intervals.clear();
    this.frames.clear();
    this.listeners = [];
    this.workers.clear();
  }
}
