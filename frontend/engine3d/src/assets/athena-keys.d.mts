/** Loader families of the legacy `/assets/athena/` mount. */
export type LegacyFamily = "geometries" | "images" | "audio" | "fonts" | "libs";
export declare const LEGACY_FAMILIES: readonly LegacyFamily[];
export declare const ATHENA_SOURCE_ROOTS: readonly string[];

/** How a slot uses its Athena GLB (one GLB can serve several legacy files). */
export type AthenaSlotRole = "model" | "skeleton" | "animation" | "lod" | "collision" | "curve";

export interface ExpandedSlot {
  /** Normalised legacy key (`geometries/npcs/present/fox/fox-idle`) or `slot:…` / `new:…`. */
  readonly key: string;
  /** Kit-relative Athena source path, e.g. `models/npcs/athena-npc-hare-pip.glb`. */
  readonly source: string;
  readonly role?: AthenaSlotRole;
  /** Embedded animation clip name, for `role: "animation"`. */
  readonly clip?: string;
  /** Detail level 0..3, for terrain `role: "lod"`. */
  readonly lod?: number;
  readonly note?: string;
}
export interface ExpandedLegacyMap {
  readonly slots: readonly ExpandedSlot[];
  readonly fonts: readonly { readonly key: string; readonly description: string }[];
  readonly notes: readonly { readonly key: string; readonly value: string }[];
  readonly missing: readonly { readonly key: string; readonly source: string }[];
}

export interface AthenaAvatarOutfit {
  readonly hair: string;
  readonly top: string;
  readonly bottom: string;
  readonly shoes: string;
  readonly accessories: readonly string[];
}
export declare const ATHENA_AVATAR_OUTFIT: {
  readonly hair: "bob";
  readonly top: "poncho";
  readonly bottom: "shorts";
  readonly shoes: "boots";
  readonly accessories: readonly ["scarf-satchel"];
};
export declare function avatarOutfitSources(outfit?: AthenaAvatarOutfit): string[];
export declare function normalizeLegacyKey(path: string, family?: LegacyFamily): string;
export declare function expandLegacyMap(
  legacyToAthena: Readonly<Record<string, string>>,
  legacyKeys: Iterable<string>,
  athenaSources: Iterable<string>,
): ExpandedLegacyMap;
