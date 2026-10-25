"use client";
import { useEffect, useRef, useState } from "react";

export interface AssetViewerParams {
  key: string;
  yaw?: number;
  elev?: number;
  fit?: number;
  grid?: boolean;
  ref?: boolean;
  clip?: string;
  t?: number;
  quality?: "low" | "high";
}

/** Mounts the engine's asset turntable; the render-review script drives it via `__athenaShot`. */
export function AssetViewerClient({ params }: { params: AssetViewerParams }) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const serialized = JSON.stringify(params);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const options = JSON.parse(serialized) as AssetViewerParams;
    queueMicrotask(async () => {
      if (cancelled || !host.current) return;
      try {
        const { createAssetViewer } = await import("@athena/engine3d/dev");
        if (cancelled || !host.current) return;
        const viewer = await createAssetViewer(host.current, options);
        if (cancelled) viewer.dispose();
        else dispose = viewer.dispose;
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      }
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [serialized]);

  return (
    <main style={{ position: "fixed", inset: 0, background: "#efe6d3" }}>
      <div ref={host} style={{ position: "absolute", inset: 0 }} aria-label="Asset viewer" />
      <p
        className="dev-asset-caption"
        data-viewer-error={error || undefined}
        style={{
          position: "absolute",
          left: 12,
          bottom: 8,
          margin: 0,
          font: "12px/1.4 system-ui, sans-serif",
          color: "#2b2b2b",
          textShadow: "0 0 3px #fff",
          pointerEvents: "none",
        }}
      >
        {error ? `Could not render ${params.key}: ${error}` : params.key}
      </p>
    </main>
  );
}
