import { domainEventSchema, type DomainEvent, type EventQuery } from "@athena/shared";

export type DomainEventHandler = (event: DomainEvent) => void | Promise<void>;

/** Append-only log plus an in-process bus. Appending the same event id twice is a no-op. */
export interface DomainEventStore {
  append(event: unknown): Promise<{ appended: boolean; event: DomainEvent }>;
  list(query?: EventQuery): Promise<DomainEvent[]>;
  subscribe(handler: DomainEventHandler): () => void;
}

export interface InMemoryDomainEventStoreOptions {
  /** Handler failures never lose the event or block other handlers. Defaults to stderr. */
  onHandlerError?: (error: unknown, event: DomainEvent) => void;
}

export class InMemoryDomainEventStore implements DomainEventStore {
  private readonly events = new Map<string, DomainEvent>();
  private readonly handlers = new Set<DomainEventHandler>();

  constructor(private readonly options: InMemoryDomainEventStoreOptions = {}) {}

  async append(input: unknown) {
    const event = domainEventSchema.parse(input);
    const existing = this.events.get(event.id);
    if (existing) return { appended: false, event: existing };
    this.events.set(event.id, event);
    for (const handler of [...this.handlers]) {
      try {
        await handler(event);
      } catch (error) {
        (this.options.onHandlerError ?? defaultOnHandlerError)(error, event);
      }
    }
    return { appended: true, event };
  }

  async list(query: EventQuery = {}) {
    return [...this.events.values()]
      .filter(
        (event) =>
          (!query.type || event.type === query.type) &&
          (!query.classId || event.classId === query.classId) &&
          (!query.studentId || event.studentId === query.studentId) &&
          (!query.since || event.occurredAt >= query.since),
      )
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  subscribe(handler: DomainEventHandler) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }
}

function defaultOnHandlerError(error: unknown, event: DomainEvent) {
  process.stderr.write(
    `domain event handler failed for ${event.type} ${event.id}: ${String(error)}\n`,
  );
}
