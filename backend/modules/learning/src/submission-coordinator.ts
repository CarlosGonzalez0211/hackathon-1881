/**
 * Coalesces simultaneous retries and serializes mutations for one student topic inside one API
 * process. The database unique index is still the cross-process idempotency source of truth.
 */
export class SubmissionCoordinator {
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly serialTails = new Map<string, Promise<void>>();

  runOnce<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const pending = operation().finally(() => {
      if (this.inFlight.get(key) === pending) this.inFlight.delete(key);
    });
    this.inFlight.set(key, pending);
    return pending;
  }

  runSerial<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.serialTails.get(key) ?? Promise.resolve();
    const pending = previous.catch(() => undefined).then(operation);
    const tail = pending.then(
      () => undefined,
      () => undefined,
    );
    this.serialTails.set(key, tail);
    void tail.finally(() => {
      if (this.serialTails.get(key) === tail) this.serialTails.delete(key);
    });
    return pending;
  }
}
