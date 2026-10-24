/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 330952:331071.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0827(scope) {
scope.alphahash_fragment = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`;
}
