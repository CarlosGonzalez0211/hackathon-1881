/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 332527:332803.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0831(scope) {
scope.alphatest_fragment = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`;
}
