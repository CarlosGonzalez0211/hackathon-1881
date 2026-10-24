/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 401928:402226.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0911(scope) {
scope.project_vertex = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`;
}
