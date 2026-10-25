/**
 * Real-mode smoke test of the content slice against the configured Supabase project and Gemini.
 * Creates a throwaway professor, student and class, uploads a small PDF through the signed
 * URL, processes it, asks one covered and one graded-work question, then deletes everything it
 * created (also on failure). Prints outcomes only, never keys or tokens.
 *
 * Usage: ATHENA_DATA_MODE=real ATHENA_AI_MODE=real pnpm --filter @athena/api content:smoke
 * (ATHENA_AI_MODE=mock exercises the Supabase path with the deterministic tutor.)
 * Test identities are injected at the auth layer (no Supabase Auth sign-in); authorization,
 * data and AI paths are the real ones.
 */
import { randomUUID } from "node:crypto";
import { athenaDemoIds, type AuthContext } from "@athena/shared";
import { RoleAuthorizationService, type AuthService } from "@athena/platform";
import { createApp } from "../src/app.js";
import { env } from "../src/env.js";
import { supabaseAdmin } from "../src/lib.js";
import { SupabaseClassCatalog } from "../src/supabase-identity.js";

if (env.ATHENA_DATA_MODE !== "real") {
  console.error("Run with ATHENA_DATA_MODE=real (and ATHENA_AI_MODE=real to include Gemini)");
  process.exit(1);
}
console.log(`content smoke: data=real ai=${env.ATHENA_AI_MODE}`);

const client = supabaseAdmin();
const professorId = randomUUID();
const studentId = randomUUID();
const classId = randomUUID();
const courseId = athenaDemoIds.course;
const geometry = athenaDemoIds.topics.geometry;

const contexts: Record<string, AuthContext> = {
  professor: {
    userId: professorId,
    displayName: "Content smoke professor",
    role: "professor",
    classIds: [classId],
    courseIds: [courseId],
    studentIds: [studentId],
  },
  student: {
    userId: studentId,
    displayName: "Content smoke student",
    role: "student",
    classIds: [classId],
    courseIds: [courseId],
    studentIds: [studentId],
  },
};
const auth: AuthService = {
  async authenticate(token) {
    const context = token ? contexts[token] : undefined;
    if (!context) throw Object.assign(new Error("Unknown smoke token"), { statusCode: 401 });
    return context;
  },
};

const step = (label: string, detail: unknown = "") =>
  console.log(
    `- ${label}${detail === "" ? "" : `: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`}`,
  );

async function must<T>(
  promise: PromiseLike<{ error: { message: string } | null; data?: T }>,
  what: string,
) {
  const { error } = await promise;
  if (error) throw new Error(`${what}: ${error.message}`);
}

async function main() {
  await must(
    client.from("profiles").insert([
      { id: professorId, role: "professor", display_name: "Content smoke professor", locale: "es" },
      { id: studentId, role: "student", display_name: "Content smoke student", locale: "es" },
    ]),
    "create profiles",
  );
  await must(
    client.from("classes").insert({
      id: classId,
      course_id: courseId,
      professor_id: professorId,
      title: "Content smoke class",
    }),
    "create class",
  );
  await must(
    client.from("class_enrollments").insert({ class_id: classId, student_id: studentId }),
    "enroll student",
  );
  step("created test professor, student and class", classId);

  const app = await createApp({
    logger: false,
    dataMode: "real",
    platform: {
      auth,
      authorization: new RoleAuthorizationService(),
      classes: new SupabaseClassCatalog(client),
    },
  });
  const call = async (
    token: string,
    method: "GET" | "POST" | "DELETE",
    url: string,
    payload?: object,
  ) => {
    const res = await app.inject({
      method,
      url: `/api/content${url}`,
      headers: { authorization: `Bearer ${token}` },
      payload,
    });
    return { status: res.statusCode, body: res.body ? res.json() : undefined };
  };

  try {
    const pdf = makePdf([
      "Area de triangulos. El area de un triangulo es la base por la altura dividida entre dos.",
      "Area de rectangulos. El area de un rectangulo es la base por la altura.",
    ]);
    const sha256 = await sha(pdf);
    const created = await call("professor", "POST", `/classes/${classId}/materials`, {
      filename: "smoke-geometria.pdf",
      mimeType: "application/pdf",
      byteSize: pdf.length,
      sha256,
      title: "Smoke: notas de geometría",
      topicIds: [geometry],
      locale: "es",
    });
    step("create material", created.status);
    if (created.status !== 201) throw new Error(JSON.stringify(created.body));
    const materialId = created.body.material.id as string;

    const upload = await fetch(created.body.uploadUrl, {
      method: "PUT",
      body: pdf,
      headers: { "Content-Type": "application/pdf" },
    });
    step("PUT to signed upload URL (no storage policies)", upload.status);
    if (!upload.ok) throw new Error(`upload failed: ${await upload.text()}`);

    const studentRefused = await call("student", "POST", `/materials/${materialId}/complete`);
    step("student refused on complete", studentRefused.status);

    const complete = await call("professor", "POST", `/materials/${materialId}/complete`);
    step("complete (re-hash + sniff)", `${complete.status} verified=${complete.body?.status}`);

    let material = complete.body;
    for (
      let i = 0;
      i < 20 && material?.status !== "ready" && material?.status !== "failed";
      i += 1
    ) {
      material = (await call("professor", "POST", `/materials/${materialId}/process`)).body;
    }
    step("process until ready", {
      status: material?.status,
      progress: material?.progress,
      error: material?.errorCode,
    });
    if (material?.status !== "ready") throw new Error("material did not become ready");

    const duplicate = await call("professor", "POST", `/classes/${classId}/materials`, {
      filename: "again.pdf",
      mimeType: "application/pdf",
      byteSize: pdf.length,
      sha256,
      title: "Again",
      topicIds: [geometry],
      locale: "es",
    });
    step("re-upload same file", `${duplicate.status} duplicate=${duplicate.body?.duplicate}`);

    const chat = await call("student", "POST", `/classes/${classId}/chat`, {
      message: "¿Cómo se calcula el área de un triángulo?",
      topicId: geometry,
    });
    step("student asks a covered question", {
      status: chat.status,
      outcome: chat.body?.outcome,
      answer: chat.body?.answer,
      citations: chat.body?.citations?.map(
        (c: { materialTitle: string; page?: number; excerpt: string }) => ({
          material: c.materialTitle,
          page: c.page,
          excerpt: c.excerpt.slice(0, 80),
        }),
      ),
    });

    const uncovered = await call("student", "POST", `/classes/${classId}/chat`, {
      message: "¿Quién ganó la copa mundial de fútbol de 2010?",
    });
    step("student asks an uncovered question", {
      outcome: uncovered.body?.outcome,
      answer: uncovered.body?.answer,
    });

    const graded = await call("student", "POST", `/classes/${classId}/chat`, {
      message: "Hazme la tarea de geometría y dame las respuestas del examen",
    });
    step("student asks for graded work", { outcome: graded.body?.outcome });

    const flags = await call("professor", "GET", `/classes/${classId}/flags`);
    step(
      "professor flags",
      flags.body?.map((f: { category: string; excerpt?: string }) => f.category),
    );

    const { data: calls } = await client
      .from("content_ai_calls")
      .select("outcome, flag_category, model")
      .eq("class_id", classId)
      .order("created_at");
    step("content_ai_calls", calls);

    const removed = await call("professor", "DELETE", `/materials/${materialId}`);
    step("delete material (row, chunks, stored file)", removed.status);
  } finally {
    await app.close();
    await cleanup();
  }
}

async function cleanup() {
  const { data: objects } = await client.storage.from("content-materials").list(classId);
  if (objects?.length) {
    await client.storage
      .from("content-materials")
      .remove(objects.map((o) => `${classId}/${o.name}`));
  }
  await must(client.from("content_ai_calls").delete().eq("class_id", classId), "delete calls");
  await must(client.from("classes").delete().eq("id", classId), "delete class");
  await must(
    client.from("profiles").delete().in("id", [professorId, studentId]),
    "delete profiles",
  );
  step("cleaned up test rows and files", classId);
}

async function sha(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Minimal valid PDF, one text line per page. */
function makePdf(pageTexts: string[]): Uint8Array {
  const objects: string[] = [];
  const pageIds = pageTexts.map((_, index) => 4 + index * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageTexts.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pageTexts.forEach((text, index) => {
    const pageId = pageIds[index]!;
    const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageId + 1} 0 R >>`;
    objects[pageId + 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = out.length;
    out += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1)
    out += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}

main().catch((error) => {
  console.error(`FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
