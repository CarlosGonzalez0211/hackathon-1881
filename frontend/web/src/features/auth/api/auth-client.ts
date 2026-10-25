import { authContextSchema, athenaDemoIds, type AuthContext } from "@athena/shared";
import { api } from "@/lib/api";
import { useMocks } from "@/lib/mode";

export interface AuthClient {
  getCurrentUser(): Promise<AuthContext>;
}

/** Demo professor, matching the backend allow-all stub. */
export class MockAuthClient implements AuthClient {
  async getCurrentUser(): Promise<AuthContext> {
    return {
      userId: athenaDemoIds.professorRuiz,
      role: "admin",
      classIds: [athenaDemoIds.class],
      courseIds: [athenaDemoIds.course],
    };
  }
}

/** STUB: sends no bearer token yet. Supabase session handling replaces this. */
export class ApiAuthClient implements AuthClient {
  async getCurrentUser() {
    return authContextSchema.parse(await api("/auth/me"));
  }
}

export const getAuthClient = (): AuthClient =>
  useMocks ? new MockAuthClient() : new ApiAuthClient();
