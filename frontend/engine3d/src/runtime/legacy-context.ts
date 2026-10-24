/**
 * The recovered engine has dynamically linked program bindings. Its public API
 * is typed; this private bridge deliberately records the legacy dynamic boundary.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LegacyContext = Record<string, any>;
