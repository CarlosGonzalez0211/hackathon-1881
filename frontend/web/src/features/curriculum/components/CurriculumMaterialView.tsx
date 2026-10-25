import type { HouseContent } from "@athena/shared";

const labels: Record<HouseContent["resources"][number]["format"], string> = {
  text: "Lesson",
  worked_example: "Worked example",
  visual_summary: "Visual summary",
  slides: "Slide outline",
  audio: "Audio resource",
  podcast: "Podcast script",
  music: "Mnemonic lyrics",
  video: "Video resource",
  reel: "Reel resource",
};
function webLink(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}
/** Seeded titles carry a "[DEMO]" marker that students should not see. */
const cleanTitle = (title: string) => title.replace(/^\s*\[demo\]\s*/i, "");
/**
 * Bodies end with a provenance line ("Source: … | chunkId=…"). It stays available for
 * traceability, folded under the lesson instead of read as part of it.
 */
function splitProvenance(body: string): { text: string; provenance?: string } {
  const lines = body.split("\n");
  const at = lines.findIndex((line) => /^\s*(source|fuente)\s*:/i.test(line));
  if (at === -1) return { text: body };
  return {
    text: lines.slice(0, at).join("\n").trim(),
    provenance: lines.slice(at).join("\n").trim(),
  };
}
const fileKind = (mimeType: string) =>
  mimeType === "text/plain" ? "TXT" : mimeType === "application/pdf" ? "PDF" : "Document";

/** Pure presentation: resource bodies and citations remain escaped plain text. */
export function CurriculumMaterialView({ content }: { content: HouseContent }) {
  const materials = content.materials.filter((m) => m.status === "ready");
  if (!materials.length && !content.resources.length)
    return <p role="status">No content is available for this topic in the selected language.</p>;
  return (
    <>
      {content.summary && <p data-part="summary">{content.summary}</p>}
      {materials.length > 0 && (
        <ul aria-label="Instructor materials" data-part="files">
          {materials.map((material) => (
            <li key={material.id} data-part="file">
              <span data-part="fileKind" data-kind={fileKind(material.mimeType)}>
                {fileKind(material.mimeType)}
              </span>
              <span data-part="fileText">
                <strong>{cleanTitle(material.title)}</strong>
                <small>{material.filename}</small>
              </span>
              {webLink(material.url) && (
                <a href={webLink(material.url)} target="_blank" rel="noreferrer">
                  Open material
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      {content.resources.map((resource) => {
        const { text, provenance } = splitProvenance(resource.body ?? "");
        return (
          <article key={resource.id} data-part="lesson" data-format={resource.format}>
            <small data-part="format">{labels[resource.format]}</small>
            <h3>{cleanTitle(resource.title)}</h3>
            {text && (
              <p data-part="body" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {text}
              </p>
            )}
            {provenance && (
              <details data-part="provenance">
                <summary>Source</summary>
                <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {cleanTitle(provenance.replace(/^\s*(source|fuente)\s*:\s*/i, ""))}
                </p>
              </details>
            )}
            {webLink(resource.url) && (
              <a href={webLink(resource.url)} target="_blank" rel="noreferrer">
                Open resource
              </a>
            )}
          </article>
        );
      })}
    </>
  );
}
