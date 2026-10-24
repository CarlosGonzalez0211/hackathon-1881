/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1202101:1205718.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1695(scope) {
scope.custom_default = `float outline(
    sampler2D tColor, 
    sampler2D tInfo, 
    vec2 uv, 
    float outlineWidth, 
    float scale, 
    vec3 idRange, 
    vec3 depthRange, 
    vec3 normalRange, 
    float rangeSmoothMargin, 
    float idMinScale, 
    vec2 distanceFadeRange, 
    vec2 nearFar, 

    
    inout float nearestDepth,
    inout float centDepth)
{
    vec2 offset = 1.0 / vec2(textureSize(tInfo, 0)) * outlineWidth * scale;

    
    
    float contributions[5];
    float faceIds[5];
    float depths[5];
    vec3 normals[5];

    vec2 dirs[5] = vec2[5](vec2(0, 0), vec2(-1, 0), vec2(1, 0), vec2(0, -1), vec2(0, 1)); 
    vec4 n; vec2 dir;
    #pragma unroll_loop_start
    for (int i = 0; i < 5; i++) {
        dir = dirs[i];
        n = texture(tInfo, uv + offset * dir); 
        contributions[i] = n.a; 
        depths[i] = getLinearDepth(1.0 - n.r, nearFar.x, nearFar.y);
        normals[i] = decodeNormalSpheremap(n.gb);
        faceIds[i] = texture(tColor, uv + offset * dir).a;
    }
    #pragma unroll_loop_end

    
    float centerId = faceIds[0];
    float centerDepth = depths[0];
    float centerContribution = contributions[0];
    vec3 centerNormal = normals[0];

    centDepth = centerDepth;

    vec2 idVariation = vec2((faceIds[1] - centerId) - (faceIds[2] - centerId), (faceIds[3] - centerId) - (faceIds[4] - centerId));
    vec2 depthVariation = vec2((depths[1] - centerDepth) - (depths[2] - centerDepth), (depths[3] - centerDepth) - (depths[4] - centerDepth));
    vec2 normalVariation = vec2(distance(normals[1], centerNormal) - distance(normals[2], centerNormal), distance(normals[3], centerNormal) - distance(normals[4], centerNormal));

    float idVariationTotal = sqrt((idVariation.x * idVariation.x) + (idVariation.y * idVariation.y));
    float depthVariationTotal = sqrt((depthVariation.x * depthVariation.x) + (depthVariation.y * depthVariation.y));
    float normalVariationTotal = sqrt((normalVariation.x * normalVariation.x) + (normalVariation.y * normalVariation.y));

    
    float idContribution = fit(fit(idVariationTotal, idRange.x, idRange.y, 0.0, 1.0), idRange.z, idRange.z + rangeSmoothMargin, 0.0, 1.0);
    idContribution = mix(idContribution * idMinScale, idContribution, clamp(scale, 0.0, 1.0));

    
    float normalContribution = fit(fit(normalVariationTotal, normalRange.x, normalRange.y, 0.0, 1.0), normalRange.z, normalRange.z + rangeSmoothMargin, 0.0, 1.0);

    
    float depthLimit = depthRange.z + 1.0 - centerNormal.z;
    float depthContribution = fit(fit(depthVariationTotal, depthRange.x, depthRange.y, 0.0, 1.0), depthLimit, depthLimit + rangeSmoothMargin, 0.0, 1.0);

    
    float minDepth = centerDepth;
    float minContrib = centerContribution;

    #pragma unroll_loop_start
    for (int i = 1; i < 5; i++) {
        if (depths[i] < minDepth) {
            minDepth = depths[i];
            minContrib = contributions[i];
        }
    }
    #pragma unroll_loop_end

    
    nearestDepth = minDepth;

    
    if (minDepth < centerDepth) {
        
        
        if (minContrib > centerContribution) centerContribution = max(centerContribution, ceil(minContrib));
        else centerContribution = min(centerContribution, floor(minContrib));
    }

    
    float viewZ = -orthographicDepthToViewZ(minDepth, nearFar.x, nearFar.y);
    centerContribution *= fit(viewZ, distanceFadeRange.x, distanceFadeRange.y, 1.0, 0.0);

    return clamp(idContribution + normalContribution + depthContribution, 0.0, 1.0) * centerContribution;
}`;
}
