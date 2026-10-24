/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 332338:332443.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0829(scope) {
scope.alphamap_fragment = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`;
}
