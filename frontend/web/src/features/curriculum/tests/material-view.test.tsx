import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CurriculumMaterialView } from "../components/CurriculumMaterialView";
import type { HouseContent } from "@athena/shared";
const content: HouseContent = {
  topicId: "topic-comparing-rights",
  courseId: "course-history-1",
  title: "History",
  updatedAt: "2026-10-24T00:00:00.000Z",
  materials: [
    {
      id: "material",
      title: "Demo TXT notes",
      filename: "lesson.txt",
      mimeType: "text/plain",
      status: "ready",
    },
  ],
  resources: [
    {
      id: "source",
      format: "text",
      title: "Source text",
      body: "Lesson text\nSource: material | section | chunkId=one",
    },
    {
      id: "podcast",
      format: "podcast",
      title: "Demo podcast",
      body: "[script; no media file]\nHost: Lesson\nSource: chunkId=one",
    },
    { id: "lyrics", format: "music", title: "Demo lyrics", body: "First line\nSecond line" },
    { id: "slides", format: "slides", title: "Demo slides", body: "Slide 1\nSlide 2" },
  ],
};
test("renders TXT lessons, script/lyrics/outline labels, citations, and preserved line breaks", () => {
  const html = renderToStaticMarkup(<CurriculumMaterialView content={content} />);
  for (const text of [
    "TXT",
    "lesson.txt",
    "Lesson text",
    "chunkId=one",
    "Podcast script",
    "Mnemonic lyrics",
    "Slide outline",
    "First line\nSecond line",
    "white-space:pre-wrap",
  ])
    assert.ok(html.includes(text), text);
  assert.ok(!html.includes("<audio"));
  assert.ok(!html.includes("<video"));
  assert.ok(!html.includes("Vista previa pronto"));
});
test("renders an honest empty-language state", () => {
  const html = renderToStaticMarkup(
    <CurriculumMaterialView content={{ ...content, materials: [], resources: [] }} />,
  );
  assert.ok(html.includes("No content is available"));
});
test("renders bodies as escaped text and rejects unsafe links", () => {
  const html = renderToStaticMarkup(
    <CurriculumMaterialView
      content={{
        ...content,
        resources: [
          {
            id: "unsafe",
            format: "text",
            title: "Example",
            body: "<script>alert(1)</script>",
            url: "javascript:alert(1)",
          },
        ],
      }}
    />,
  );
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("javascript:"));
});
