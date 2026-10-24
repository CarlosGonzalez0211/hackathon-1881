/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 416621:416858.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0920(scope) {
scope.skinbase_vertex = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`;
}
