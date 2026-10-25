import { athenaDemoIds, type AuthContext, type Class } from "@athena/shared";

/** Class metadata the caller can see. The Supabase version reads `classes` for the caller's class ids. */
export interface ClassCatalog {
  listFor(context: AuthContext): Promise<Class[]>;
}

export const demoClass: Class = {
  id: athenaDemoIds.class,
  courseId: athenaDemoIds.course,
  professorId: athenaDemoIds.professorRuiz,
  title: "Matemáticas I – Grupo A",
  term: "2026-2",
  createdAt: "2026-10-24T00:00:00.000Z",
};

export class InMemoryClassCatalog implements ClassCatalog {
  constructor(private readonly classes: Class[] = [demoClass]) {}

  async listFor(context: AuthContext) {
    return this.classes.filter(
      (item) => context.role === "admin" || context.classIds.includes(item.id),
    );
  }
}
