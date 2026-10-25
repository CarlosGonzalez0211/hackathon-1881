import type { HouseContent } from "@athena/shared";
const labels: Record<HouseContent["resources"][number]["format"], string> = {
  text: "TXT lesson",
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
/** Pure presentation: resource bodies and citations remain escaped plain text. */
export function CurriculumMaterialView({ content }: { content: HouseContent }) {
  const materials = content.materials.filter((m) => m.status === "ready");
  if (!materials.length && !content.resources.length)
    return <p role="status">No content is available for this topic in the selected language.</p>;
  return (
    <>
      {content.summary && <p>{content.summary}</p>}
      {materials.length > 0 && (
        <ul aria-label="Instructor materials">
          {materials.map((material) => (
            <li key={material.id}>
              <span>
                {material.mimeType === "text/plain"
                  ? "TXT"
                  : material.mimeType === "application/pdf"
                    ? "PDF"
                    : "Document"}
              </span>
              <strong>{material.title}</strong>
              <small>{material.filename}</small>
              {webLink(material.url) && (
                <a href={webLink(material.url)} target="_blank" rel="noreferrer">
                  Open material
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      {content.resources.map((resource) => (
        <article key={resource.id}>
          <small>{labels[resource.format]}</small>
          <h3>{resource.title}</h3>
          {resource.body && (
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{resource.body}</p>
          )}
          {webLink(resource.url) && (
            <a href={webLink(resource.url)} target="_blank" rel="noreferrer">
              Open resource
            </a>
          )}
        </article>
      ))}
    </>
  );
}
