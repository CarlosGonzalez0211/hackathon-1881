import type { ReactNode } from "react";
import { WorldProvider } from "@/features/world/WorldProvider";

/**
 * The world stays mounted in `children` while the `house` slot shows the intercepted house
 * page on top (soft navigation). A hard load of /world/house/[id] renders the standalone page.
 */
export default function WorldLayout({
  children,
  house,
}: {
  children: ReactNode;
  house: ReactNode;
}) {
  return (
    <WorldProvider>
      {children}
      {house}
    </WorldProvider>
  );
}
