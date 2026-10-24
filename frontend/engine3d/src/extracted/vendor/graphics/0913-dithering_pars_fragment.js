/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 402325:402669.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0913(scope) {
scope.dithering_pars_fragment = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`;
}
