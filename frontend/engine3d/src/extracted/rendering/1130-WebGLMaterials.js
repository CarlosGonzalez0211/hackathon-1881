/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 628773:635450.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1130(scope) {
scope.WebGLMaterials = function WebGLMaterials(r, e) {
  function i(M, w) {
    M.matrixAutoUpdate === !0 && M.updateMatrix(), w.value.copy(M.matrix);
  }
  function s(M, w) {
    w.color.getRGB(M.fogColor.value, scope.getUnlitUniformColorSpace(r)), w.isFog ? (M.fogNear.value = w.near, M.fogFar.value = w.far) : w.isFogExp2 && (M.fogDensity.value = w.density);
  }
  function a(M, w, D, R, P) {
    w.isMeshBasicMaterial || w.isMeshLambertMaterial ? o(M, w) : w.isMeshToonMaterial ? (o(M, w), f(M, w)) : w.isMeshPhongMaterial ? (o(M, w), p(M, w)) : w.isMeshStandardMaterial ? (o(M, w), _(M, w), w.isMeshPhysicalMaterial && x(M, w, P)) : w.isMeshMatcapMaterial ? (o(M, w), b(M, w)) : w.isMeshDepthMaterial ? o(M, w) : w.isMeshDistanceMaterial ? (o(M, w), T(M, w)) : w.isMeshNormalMaterial ? o(M, w) : w.isLineBasicMaterial ? (l(M, w), w.isLineDashedMaterial && c(M, w)) : w.isPointsMaterial ? h(M, w, D, R) : w.isSpriteMaterial ? d(M, w) : w.isShadowMaterial ? (M.color.value.copy(w.color), M.opacity.value = w.opacity) : w.isShaderMaterial && (w.uniformsNeedUpdate = !1);
  }
  function o(M, w) {
    M.opacity.value = w.opacity, w.color && M.diffuse.value.copy(w.color), w.emissive && M.emissive.value.copy(w.emissive).multiplyScalar(w.emissiveIntensity), w.map && (M.map.value = w.map, i(w.map, M.mapTransform)), w.alphaMap && (M.alphaMap.value = w.alphaMap, i(w.alphaMap, M.alphaMapTransform)), w.bumpMap && (M.bumpMap.value = w.bumpMap, i(w.bumpMap, M.bumpMapTransform), M.bumpScale.value = w.bumpScale, w.side === scope.BackSide && (M.bumpScale.value *= -1)), w.normalMap && (M.normalMap.value = w.normalMap, i(w.normalMap, M.normalMapTransform), M.normalScale.value.copy(w.normalScale), w.side === scope.BackSide && M.normalScale.value.negate()), w.displacementMap && (M.displacementMap.value = w.displacementMap, i(w.displacementMap, M.displacementMapTransform), M.displacementScale.value = w.displacementScale, M.displacementBias.value = w.displacementBias), w.emissiveMap && (M.emissiveMap.value = w.emissiveMap, i(w.emissiveMap, M.emissiveMapTransform)), w.specularMap && (M.specularMap.value = w.specularMap, i(w.specularMap, M.specularMapTransform)), w.alphaTest > 0 && (M.alphaTest.value = w.alphaTest);
    const D = e.get(w),
      R = D.envMap,
      P = D.envMapRotation;
    R && (M.envMap.value = R, scope._e1.copy(P), scope._e1.x *= -1, scope._e1.y *= -1, scope._e1.z *= -1, R.isCubeTexture && R.isRenderTargetTexture === !1 && (scope._e1.y *= -1, scope._e1.z *= -1), M.envMapRotation.value.setFromMatrix4(scope._m1.makeRotationFromEuler(scope._e1)), M.flipEnvMap.value = R.isCubeTexture && R.isRenderTargetTexture === !1 ? -1 : 1, M.reflectivity.value = w.reflectivity, M.ior.value = w.ior, M.refractionRatio.value = w.refractionRatio), w.lightMap && (M.lightMap.value = w.lightMap, M.lightMapIntensity.value = w.lightMapIntensity, i(w.lightMap, M.lightMapTransform)), w.aoMap && (M.aoMap.value = w.aoMap, M.aoMapIntensity.value = w.aoMapIntensity, i(w.aoMap, M.aoMapTransform));
  }
  function l(M, w) {
    M.diffuse.value.copy(w.color), M.opacity.value = w.opacity, w.map && (M.map.value = w.map, i(w.map, M.mapTransform));
  }
  function c(M, w) {
    M.dashSize.value = w.dashSize, M.totalSize.value = w.dashSize + w.gapSize, M.scale.value = w.scale;
  }
  function h(M, w, D, R) {
    M.diffuse.value.copy(w.color), M.opacity.value = w.opacity, M.size.value = w.size * D, M.scale.value = R * .5, w.map && (M.map.value = w.map, i(w.map, M.uvTransform)), w.alphaMap && (M.alphaMap.value = w.alphaMap, i(w.alphaMap, M.alphaMapTransform)), w.alphaTest > 0 && (M.alphaTest.value = w.alphaTest);
  }
  function d(M, w) {
    M.diffuse.value.copy(w.color), M.opacity.value = w.opacity, M.rotation.value = w.rotation, w.map && (M.map.value = w.map, i(w.map, M.mapTransform)), w.alphaMap && (M.alphaMap.value = w.alphaMap, i(w.alphaMap, M.alphaMapTransform)), w.alphaTest > 0 && (M.alphaTest.value = w.alphaTest);
  }
  function p(M, w) {
    M.specular.value.copy(w.specular), M.shininess.value = Math.max(w.shininess, 1e-4);
  }
  function f(M, w) {
    w.gradientMap && (M.gradientMap.value = w.gradientMap);
  }
  function _(M, w) {
    M.metalness.value = w.metalness, w.metalnessMap && (M.metalnessMap.value = w.metalnessMap, i(w.metalnessMap, M.metalnessMapTransform)), M.roughness.value = w.roughness, w.roughnessMap && (M.roughnessMap.value = w.roughnessMap, i(w.roughnessMap, M.roughnessMapTransform)), w.envMap && (M.envMapIntensity.value = w.envMapIntensity);
  }
  function x(M, w, D) {
    M.ior.value = w.ior, w.sheen > 0 && (M.sheenColor.value.copy(w.sheenColor).multiplyScalar(w.sheen), M.sheenRoughness.value = w.sheenRoughness, w.sheenColorMap && (M.sheenColorMap.value = w.sheenColorMap, i(w.sheenColorMap, M.sheenColorMapTransform)), w.sheenRoughnessMap && (M.sheenRoughnessMap.value = w.sheenRoughnessMap, i(w.sheenRoughnessMap, M.sheenRoughnessMapTransform))), w.clearcoat > 0 && (M.clearcoat.value = w.clearcoat, M.clearcoatRoughness.value = w.clearcoatRoughness, w.clearcoatMap && (M.clearcoatMap.value = w.clearcoatMap, i(w.clearcoatMap, M.clearcoatMapTransform)), w.clearcoatRoughnessMap && (M.clearcoatRoughnessMap.value = w.clearcoatRoughnessMap, i(w.clearcoatRoughnessMap, M.clearcoatRoughnessMapTransform)), w.clearcoatNormalMap && (M.clearcoatNormalMap.value = w.clearcoatNormalMap, i(w.clearcoatNormalMap, M.clearcoatNormalMapTransform), M.clearcoatNormalScale.value.copy(w.clearcoatNormalScale), w.side === scope.BackSide && M.clearcoatNormalScale.value.negate())), w.dispersion > 0 && (M.dispersion.value = w.dispersion), w.iridescence > 0 && (M.iridescence.value = w.iridescence, M.iridescenceIOR.value = w.iridescenceIOR, M.iridescenceThicknessMinimum.value = w.iridescenceThicknessRange[0], M.iridescenceThicknessMaximum.value = w.iridescenceThicknessRange[1], w.iridescenceMap && (M.iridescenceMap.value = w.iridescenceMap, i(w.iridescenceMap, M.iridescenceMapTransform)), w.iridescenceThicknessMap && (M.iridescenceThicknessMap.value = w.iridescenceThicknessMap, i(w.iridescenceThicknessMap, M.iridescenceThicknessMapTransform))), w.transmission > 0 && (M.transmission.value = w.transmission, M.transmissionSamplerMap.value = D.texture, M.transmissionSamplerSize.value.set(D.width, D.height), w.transmissionMap && (M.transmissionMap.value = w.transmissionMap, i(w.transmissionMap, M.transmissionMapTransform)), M.thickness.value = w.thickness, w.thicknessMap && (M.thicknessMap.value = w.thicknessMap, i(w.thicknessMap, M.thicknessMapTransform)), M.attenuationDistance.value = w.attenuationDistance, M.attenuationColor.value.copy(w.attenuationColor)), w.anisotropy > 0 && (M.anisotropyVector.value.set(w.anisotropy * Math.cos(w.anisotropyRotation), w.anisotropy * Math.sin(w.anisotropyRotation)), w.anisotropyMap && (M.anisotropyMap.value = w.anisotropyMap, i(w.anisotropyMap, M.anisotropyMapTransform))), M.specularIntensity.value = w.specularIntensity, M.specularColor.value.copy(w.specularColor), w.specularColorMap && (M.specularColorMap.value = w.specularColorMap, i(w.specularColorMap, M.specularColorMapTransform)), w.specularIntensityMap && (M.specularIntensityMap.value = w.specularIntensityMap, i(w.specularIntensityMap, M.specularIntensityMapTransform));
  }
  function b(M, w) {
    w.matcap && (M.matcap.value = w.matcap);
  }
  function T(M, w) {
    const D = e.get(w).light;
    M.referencePosition.value.setFromMatrixPosition(D.matrixWorld), M.nearDistance.value = D.shadow.camera.near, M.farDistance.value = D.shadow.camera.far;
  }
  return {
    refreshFogUniforms: s,
    refreshMaterialUniforms: a
  };
};
}
