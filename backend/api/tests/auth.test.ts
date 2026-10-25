import assert from "node:assert/strict";
import test from "node:test";
import { athenaDemoIds, authContextSchema, type AuthContext } from "@athena/shared";
import {
  DirectoryAuthService,
  InMemoryIdentityDirectory,
  RoleAuthorizationService,
  StaticTokenVerifier,
} from "@athena/platform";
import { createApp } from "../src/app.js";

const { students } = athenaDemoIds;
const OTHER_CLASS = "00000000-0000-4000-8000-0000000000c2";
const profile = (id: string, authUserId: string, role: "student" | "professor" | "admin") => ({
  id,
  authUserId,
  role,
  displayName: `User ${id.slice(-3)}`,
});

const PROF = "00000000-0000-4000-8000-0000000000f1";
const PROF_2 = "00000000-0000-4000-8000-0000000000f2";
const ADMIN = "00000000-0000-4000-8000-0000000000f3";

const directory = new InMemoryIdentityDirectory(
  [
    profile(PROF, "auth-prof", "professor"),
    profile(PROF_2, "auth-prof-2", "professor"),
    profile(ADMIN, "auth-admin", "admin"),
    profile(students.lucia, "auth-lucia", "student"),
    profile(students.mateo, "auth-mateo", "student"),
    profile(students.diego, "auth-diego", "student"),
  ],
  [
    {
      id: athenaDemoIds.class,
      courseId: athenaDemoIds.course,
      professorId: PROF,
      studentIds: [students.lucia, students.mateo],
    },
    {
      id: OTHER_CLASS,
      courseId: "00000000-0000-4000-8000-000000000a02",
      professorId: PROF_2,
      studentIds: [students.diego],
    },
  ],
);
const verifier = new StaticTokenVerifier({
  "tok-prof": "auth-prof",
  "tok-prof-2": "auth-prof-2",
  "tok-admin": "auth-admin",
  "tok-lucia": "auth-lucia",
  "tok-orphan": "auth-nobody",
});
const auth = new DirectoryAuthService(verifier, directory);
const authorization = new RoleAuthorizationService();

const makeApp = () =>
  createApp({ logger: false, dataMode: "mock", platform: { auth, authorization } });
const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

test("authenticate resolves role, classes and students from the profile, never the token", async () => {
  const professor = await auth.authenticate("tok-prof");
  assert.equal(professor.role, "professor");
  assert.deepEqual(professor.classIds, [athenaDemoIds.class]);
  assert.deepEqual(professor.studentIds.sort(), [students.lucia, students.mateo].sort());

  const student = await auth.authenticate("tok-lucia");
  assert.equal(student.role, "student");
  assert.deepEqual(student.studentIds, [students.lucia]);
});

test("auth/me: 401 without or with a bad token, 403 for a verified user with no profile", async () => {
  const app = await makeApp();
  try {
    assert.equal((await app.inject({ method: "GET", url: "/api/auth/me" })).statusCode, 401);
    const bad = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: bearer("tok-forged"),
    });
    assert.equal(bad.statusCode, 401);
    const orphan = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: bearer("tok-orphan"),
    });
    assert.equal(orphan.statusCode, 403);
    const ok = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: bearer("tok-prof"),
    });
    assert.equal(ok.statusCode, 200);
    assert.equal(authContextSchema.parse(ok.json()).role, "professor");
  } finally {
    await app.close();
  }
});

test("class analytics: only the class professor or an admin; students and other professors get 403", async () => {
  const app = await makeApp();
  const url = `/api/analytics/class/${athenaDemoIds.class}`;
  const status = async (token?: string) =>
    (await app.inject({ method: "GET", url, headers: token ? bearer(token) : {} })).statusCode;
  try {
    assert.equal(await status(), 401);
    assert.equal(await status("tok-prof"), 200);
    assert.equal(await status("tok-admin"), 200);
    assert.equal(await status("tok-lucia"), 403);
    assert.equal(await status("tok-prof-2"), 403);
  } finally {
    await app.close();
  }
});

test("role authorization matrix", () => {
  const ctx = (overrides: Partial<AuthContext>): AuthContext => ({
    userId: "u",
    displayName: "U",
    role: "student",
    classIds: [],
    courseIds: [],
    studentIds: [],
    ...overrides,
  });
  const student = ctx({
    classIds: [athenaDemoIds.class],
    courseIds: [athenaDemoIds.course],
    studentIds: [students.lucia],
  });
  assert.equal(authorization.canAccessClass(student, athenaDemoIds.class), true);
  assert.equal(authorization.canManageClass(student, athenaDemoIds.class), false);
  assert.equal(authorization.canAccessStudent(student, students.lucia), true);
  assert.equal(authorization.canAccessStudent(student, students.mateo), false);

  const professor = ctx({
    role: "professor",
    classIds: [athenaDemoIds.class],
    studentIds: [students.lucia, students.mateo],
  });
  assert.equal(authorization.canManageClass(professor, athenaDemoIds.class), true);
  assert.equal(authorization.canManageClass(professor, OTHER_CLASS), false);
  assert.equal(authorization.canAccessStudent(professor, students.diego), false);

  assert.equal(authorization.canManageClass(ctx({ role: "admin" }), OTHER_CLASS), true);
});
