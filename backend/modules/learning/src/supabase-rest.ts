export interface LearningRestClient {
  select<T>(table: string, filters?: Readonly<Record<string, string>>): Promise<T[]>;
  insert<T>(table: string, values: T | readonly T[]): Promise<void>;
  upsert<T>(table: string, values: T, onConflict: string): Promise<void>;
  update<T>(table: string, filters: Readonly<Record<string, string>>, values: T): Promise<void>;
  delete(table: string, filters: Readonly<Record<string, string>>): Promise<void>;
}

/** Minimal server-only Supabase PostgREST client; never expose the service-role key to a browser. */
export class SupabaseLearningRestClient implements LearningRestClient {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {}

  async select<T>(table: string, filters: Readonly<Record<string, string>> = {}): Promise<T[]> {
    const query = new URLSearchParams({ select: "*" });
    for (const [column, value] of Object.entries(filters)) query.set(column, `eq.${value}`);
    return this.request<T[]>(`${table}?${query.toString()}`, { method: "GET" });
  }

  async insert<T>(table: string, values: T | readonly T[]) {
    await this.request(table, { method: "POST", body: JSON.stringify(values) });
  }

  async upsert<T>(table: string, values: T, onConflict: string) {
    const query = new URLSearchParams({ on_conflict: onConflict });
    await this.request(`${table}?${query.toString()}`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(values),
    });
  }

  async update<T>(table: string, filters: Readonly<Record<string, string>>, values: T) {
    const query = new URLSearchParams();
    for (const [column, value] of Object.entries(filters)) query.set(column, `eq.${value}`);
    await this.request(`${table}?${query.toString()}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    });
  }

  async delete(table: string, filters: Readonly<Record<string, string>>) {
    const query = new URLSearchParams();
    for (const [column, value] of Object.entries(filters)) query.set(column, `eq.${value}`);
    await this.request(`${table}?${query.toString()}`, { method: "DELETE" });
  }

  private async request<T = void>(path: string, init: RequestInit): Promise<T> {
    const response = await this.fetchImplementation(
      `${this.url.replace(/\/$/, "")}/rest/v1/${path}`,
      {
        ...init,
        headers: {
          apikey: this.serviceRoleKey,
          Authorization: `Bearer ${this.serviceRoleKey}`,
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
      },
    );
    if (!response.ok) {
      throw new Error(
        `Supabase learning request failed (${response.status}): ${await response.text()}`,
      );
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}
