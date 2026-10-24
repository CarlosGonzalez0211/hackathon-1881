/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 398887:399084.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0908(scope) {
scope.opaque_fragment = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`;
}
