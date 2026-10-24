/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 341727:341866.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0846(scope) {
scope.color_fragment = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`;
}
