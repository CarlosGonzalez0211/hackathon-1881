/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1192279:1198107.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1692(scope) {
scope.depth_default = `float getDepth(sampler2D depth, vec2 uv) {
    return texture(depth, uv).x;
}

float linearizeDepthLog(float depth, float near, float far) {
    float d = pow(2.0, depth * log2(far + 1.0)) - 1.0;
    float a = far / (far - near);
    float b = far * near / (near - far);
    return a + b / d;
}

float perspectiveDepthToViewZ(float depth, float near, float far) {
    return (near * far) / ((far - near) * depth - far);
}

float orthographicDepthToViewZ(float depth, float near, float far) {
    return depth * (near - far) - near;
}

float viewZToPerspectiveDepth(float viewZ, float near, float far) {
	return ((near + viewZ) * far) / ((far - near) * viewZ);
}

float viewZToOrthographicDepth(float viewZ, float near, float far) {
	return (viewZ + near) / (near - far);
}

float getViewZ(float depth, float near, float far) {
    float fragCoordZ = depth;

    #ifdef ORTHOGRAPHIC_CAMERA
        return orthographicDepthToViewZ(fragCoordZ, near, far);
    #else
        #ifdef LOGDEPTH
            fragCoordZ = linearizeDepthLog(fragCoordZ, near, far);
        #endif
        return perspectiveDepthToViewZ(fragCoordZ, near, far);
    #endif
}

float getViewZ(sampler2D depth, vec2 uv, float near, float far) {
    return getViewZ(getDepth(depth, uv), near, far);
}

float getLinearDepth(float depth, float near, float far) {
    float fragCoordZ = depth;

    #ifdef ORTHOGRAPHIC_CAMERA
        return fragCoordZ;
    #else
        #ifdef LOGDEPTH
            fragCoordZ = linearizeDepthLog(fragCoordZ, near, far);
        #endif
        float viewZ = perspectiveDepthToViewZ(fragCoordZ, near, far);
        return viewZToOrthographicDepth(viewZ, near, far);
    #endif
}

float getLinearDepth(sampler2D depth, vec2 uv, float near, float far) {
    return getLinearDepth(getDepth(depth, uv), near, far);
}

vec3 getViewPosition(float depth, vec2 uv, float near, float far, mat4 projMat) {
    float viewZ = getViewZ(depth, near, far);

    #ifdef LOGDEPTH
        float d = linearizeDepthLog(depth, near, far);
    #else
        float d = depth;
    #endif

    float clipW = projMat[2][3] * viewZ + projMat[3][3];
    vec4 clipPosition = vec4((vec3(uv, d) - 0.5) * 2.0, 1.0);
    clipPosition *= clipW; 
    return (inverse(projMat) * clipPosition).xyz;
}

vec3 getViewPosition(sampler2D depth, vec2 uv, float near, float far, mat4 projMat) {
    return getViewPosition(getDepth(depth, uv), uv, near, far, projMat);
}

vec3 getWorldPosition(float depth, vec2 uv, float near, float far, mat4 projMat, mat4 worldMat) {
    return (worldMat * vec4(getViewPosition(depth, uv, near, far, projMat), 1.0)).xyz;
}

vec3 getWorldPosition(sampler2D depth, vec2 uv, float near, float far, mat4 projMat, mat4 worldMat) {
    return (worldMat * vec4(getViewPosition(getDepth(depth, uv), uv, near, far, projMat), 1.0)).xyz;
}

vec3 getViewNormal(sampler2D depth, vec2 uv, float near, float far, mat4 projMat) {
    vec2 depthres = vec2(textureSize(depth, 0));
    ivec2 p = ivec2(uv * depthres);
    float c0 = texelFetch(depth, p, 0).x;
    float l2 = texelFetch(depth, p - ivec2(2, 0), 0).x;
    float l1 = texelFetch(depth, p - ivec2(1, 0), 0).x;
    float r1 = texelFetch(depth, p + ivec2(1, 0), 0).x;
    float r2 = texelFetch(depth, p + ivec2(2, 0), 0).x;
    float b2 = texelFetch(depth, p - ivec2(0, 2), 0).x;
    float b1 = texelFetch(depth, p - ivec2(0, 1), 0).x;
    float t1 = texelFetch(depth, p + ivec2(0, 1), 0).x;
    float t2 = texelFetch(depth, p + ivec2(0, 2), 0).x;

    float dl = abs((2.0 * l1 - l2) - c0);
    float dr = abs((2.0 * r1 - r2) - c0);
    float db = abs((2.0 * b1 - b2) - c0);
    float dt = abs((2.0 * t1 - t2) - c0);

    vec3 ce = getViewPosition(c0, uv, near, far, projMat).xyz;

    vec3 dpdx = (dl < dr) ? ce - getViewPosition(l1, (uv - vec2(1.0 / depthres.x, 0.0)), near, far, projMat).xyz
                          : -ce + getViewPosition(r1, (uv + vec2(1.0 / depthres.x, 0.0)), near, far, projMat).xyz;
    vec3 dpdy = (db < dt) ? ce - getViewPosition(b1, (uv - vec2(0.0, 1.0 / depthres.y)), near, far, projMat).xyz
                          : -ce + getViewPosition(t1, (uv + vec2(0.0, 1.0 / depthres.y)), near, far, projMat).xyz;
    return normalize(cross(dpdx, dpdy));
}

vec3 getWorldNormal(sampler2D depth, vec2 uv, float near, float far, mat4 projMat, mat4 worldMat) {
    vec2 depthres = vec2(textureSize(depth, 0));
    ivec2 p = ivec2(uv * depthres);
    float c0 = texelFetch(depth, p, 0).x;
    float l2 = texelFetch(depth, p - ivec2(2, 0), 0).x;
    float l1 = texelFetch(depth, p - ivec2(1, 0), 0).x;
    float r1 = texelFetch(depth, p + ivec2(1, 0), 0).x;
    float r2 = texelFetch(depth, p + ivec2(2, 0), 0).x;
    float b2 = texelFetch(depth, p - ivec2(0, 2), 0).x;
    float b1 = texelFetch(depth, p - ivec2(0, 1), 0).x;
    float t1 = texelFetch(depth, p + ivec2(0, 1), 0).x;
    float t2 = texelFetch(depth, p + ivec2(0, 2), 0).x;

    float dl = abs((2.0 * l1 - l2) - c0);
    float dr = abs((2.0 * r1 - r2) - c0);
    float db = abs((2.0 * b1 - b2) - c0);
    float dt = abs((2.0 * t1 - t2) - c0);

    vec3 ce = getWorldPosition(c0, uv, near, far, projMat, worldMat).xyz;

    vec3 dpdx = (dl < dr) ? ce - getWorldPosition(l1, (uv - vec2(1.0 / depthres.x, 0.0)), near, far, projMat, worldMat).xyz
                          : -ce + getWorldPosition(r1, (uv + vec2(1.0 / depthres.x, 0.0)), near, far, projMat, worldMat).xyz;
    vec3 dpdy = (db < dt) ? ce - getWorldPosition(b1, (uv - vec2(0.0, 1.0 / depthres.y)), near, far, projMat, worldMat).xyz
                          : -ce + getWorldPosition(t1, (uv + vec2(0.0, 1.0 / depthres.y)), near, far, projMat, worldMat).xyz;
    return normalize(cross(dpdx, dpdy));
}`;
}
