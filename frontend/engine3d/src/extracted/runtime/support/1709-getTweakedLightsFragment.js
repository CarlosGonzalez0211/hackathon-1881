/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1220759:1221687.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1709(scope) {
scope.getTweakedLightsFragment = function getTweakedLightsFragment() {
  let r = scope.lightsFragmentBegin;
  return r = r.replace("DirectionalLight directionalLight;", `
        DirectionalLight directionalLight;
        float _dirShadow = 1.0;
    `), r = r.replace("directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;", `

        float shadow = ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
        _dirShadow *= shadow; // accumulate shadow
        directLight.color *= shadow; // same as three.js

    `), r;
};
}
