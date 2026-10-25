/**
 * Loads the shared demo content (shared/src/mocks/demo-content.ts) into the configured Supabase
 * project: the ready geometry material with its passage embedded by the configured Gemini model,
 * the class objectives and the milestone. Needs the demo class seed
 * (data/supabase/seeds/0001_demo_class.sql). Safe to re-run: existing rows are kept or updated.
 *
 * Usage: pnpm --filter @athena/api seed:content
 */
import {
  createDemoContentSeed,
  demoContentChunk,
  athenaDemoIds,
  type ContentMaterial,
} from "@athena/shared";
import { sha256Hex, type MaterialRecord } from "@athena/content";
import { GeminiEmbeddingProvider } from "../src/content-gemini.js";
import {
  SupabaseChunkRepository,
  SupabaseMaterialRepository,
  supabaseMilestoneRepository,
  supabaseObjectiveRepository,
} from "../src/content-supabase.js";
import { env } from "../src/env.js";
import { gemini, supabaseAdmin } from "../src/lib.js";

const client = supabaseAdmin();
const materials = new SupabaseMaterialRepository(client);
const chunks = new SupabaseChunkRepository(client, materials);
const objectives = supabaseObjectiveRepository(client);
const milestones = supabaseMilestoneRepository(client);
const embeddings = new GeminiEmbeddingProvider(gemini().models, env.CONTENT_EMBED_MODEL);
const actor = athenaDemoIds.professorRuiz;

/** Only searchable material is seeded: a failed upload has nothing to retrieve. */
const toRecord = (material: ContentMaterial): MaterialRecord => {
  const { progress, searchable: _searchable, ...fields } = material;
  return {
    ...fields,
    storagePath: `${material.classId}/${material.id}/${material.filename}`,
    chunksTotal: progress.total,
    chunksEmbedded: progress.embedded,
    activeGeneration: undefined,
    verifiedAt: material.createdAt,
  };
};

async function main() {
  const seed = createDemoContentSeed();

  for (const material of seed.materials.filter((item) => item.searchable)) {
    const { record, created } = await materials.insertOrGet(toRecord(material));
    console.log(`- material ${record.title}: ${created ? "created" : "already there"}`);
    if (record.activeGeneration !== undefined) continue;

    const text = demoContentChunk.text;
    const [embedding] = await embeddings.embedDocuments([
      { title: demoContentChunk.sectionTitle, text },
    ]);
    // content_activate_generation only promotes the generation the material is building.
    const { error } = await client
      .from("content_materials")
      .update({ building_generation: 1 })
      .eq("id", record.id);
    if (error) throw new Error(`mark building: ${error.message}`);
    await chunks.deleteGeneration(record.id, 1);
    await chunks.insert([
      {
        id: demoContentChunk.id,
        materialId: record.id,
        classId: record.classId,
        generation: 1,
        chunkIndex: 0,
        pageStart: demoContentChunk.pageStart,
        pageEnd: demoContentChunk.pageEnd,
        sectionTitle: demoContentChunk.sectionTitle,
        content: text,
        contentHash: sha256Hex(text),
        tokenEstimate: Math.ceil(text.length / 4),
        embedding,
        embeddingModel: embeddings.model,
      },
    ]);
    await chunks.activate(record.id, 1);
    console.log(`  passage embedded with ${embeddings.model} and activated`);
  }

  for (const objective of seed.objectives) {
    const saved = await objectives.upsert(objective, undefined, actor);
    console.log(`- objective ${objective.code}: ${saved === "conflict" ? "conflict" : "saved"}`);
  }
  for (const milestone of seed.milestones) {
    const saved = await milestones.upsert(milestone, undefined, actor);
    console.log(
      `- milestone ${milestone.title.es}: ${saved === "conflict" ? "conflict" : "saved"}`,
    );
  }
}

main().catch((error) => {
  console.error(`FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
