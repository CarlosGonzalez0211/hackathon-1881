/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 353959:354246.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0866(scope) {
scope.fog_fragment = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`;
}
