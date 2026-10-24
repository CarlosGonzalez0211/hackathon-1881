/** Renderer-neutral authoring contracts. Academic state lives in @athena/shared. */
export type Vector3Tuple = readonly [number, number, number];
export type AssetCategory =
  | "geometry"
  | "texture"
  | "audio"
  | "font"
  | "icon"
  | "codec"
  | "worker"
  | "script"
  | "style"
  | "other";
export interface AssetDefinition {
  readonly id: string;
  /** Relative to the public /assets/athena/ mount; original subtree is preserved. */
  readonly path: string;
  readonly category: AssetCategory;
  readonly bytes: number;
  readonly sha256: string;
  readonly provenance: {
    readonly sourceUrl: string;
    readonly referencePath: string;
    readonly license: string;
    readonly status: "preserved-local-artifact";
  };
}
export interface AnimationDefinition {
  readonly id: string;
  readonly assetId: string;
  readonly speed: number;
  readonly loop: boolean;
  readonly role?: string;
}
export interface InteractionDefinition {
  readonly id: string;
  readonly kind: "topic" | "dialogue" | "pending";
  readonly radius: number;
  readonly slot?: number;
  readonly implementation: "pending" | "reference";
}
export interface EntityDefinition {
  readonly id: string;
  readonly kind:
    "terrain" | "building" | "interaction-anchor" | "vegetation" | "water" | "prop" | "character";
  readonly position: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
  readonly scale?: Vector3Tuple;
  readonly assetIds?: readonly string[];
  readonly materialId?: string;
  readonly collision?: "none" | "terrain-hitmesh" | "bounds";
  readonly interaction?: InteractionDefinition;
  readonly provenance?: string;
  readonly geometryIdentification?: "pending" | "identified" | "composite";
}
export interface CharacterDefinition {
  readonly id: string;
  readonly label: string;
  readonly modelAssetId: string;
  readonly bonesAssetId: string;
  readonly animations: readonly AnimationDefinition[];
  readonly position?: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
  readonly accessories?: Readonly<Record<string, readonly string[]>>;
  readonly dialogue?: readonly string[];
  readonly voiceAssetId?: string;
  readonly curveAssetId?: string;
  readonly sourceSymbol: string;
  /** Full literal data recovered from createNPCS, including dialogue/curve/talk options. */
  readonly referenceSettings?: Readonly<Record<string, unknown>>;
}
export interface WorldDefinition {
  readonly id: string;
  readonly terrain: {
    readonly chunks: number;
    readonly detailLevels: readonly number[];
    readonly lodDistances: readonly number[];
    readonly assetIds: readonly string[];
    readonly collisionAssetIds: readonly string[];
    readonly unresolvedCompositeGeometry: boolean;
  };
  readonly entities: readonly EntityDefinition[];
  readonly characterIds: readonly string[];
  readonly environmentAssetIds: readonly string[];
  readonly geometryGroups?: readonly GeometryGroupDefinition[];
  readonly note: string;
}
/** Recovered batch boundary. Coordinates remain in source planet space. */
export interface GeometryGroupDefinition {
  readonly id: string;
  readonly assetId: string;
  readonly chunk: number;
  readonly batchId: number;
  readonly enabled: boolean;
  readonly offset: Vector3Tuple;
  readonly scale: Vector3Tuple;
  readonly rotation: Vector3Tuple;
  readonly bounds: {
    readonly min: Vector3Tuple;
    readonly max: Vector3Tuple;
    readonly center: Vector3Tuple;
  };
  readonly geometryIdentification: "unverified";
}
