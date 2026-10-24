/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1171366:1173096.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1674(scope) {
scope.falloff_default = `float _linstep(float begin, float end, float t) {
    return clamp((t - begin) / (end - begin), 0.0, 1.0);
}

float _pl(vec2 _input, vec2 start, vec2 end, float margin, float progress) {
    vec2 v = end - start;
    float dist = length(v);
    vec2 dir = v / dist;
    return dot(dir, _input - start - dir * (dist + margin) * progress);
}

float _pl(vec3 _input, vec3 start, vec3 end, float margin, float progress) {
    vec3 v = end - start;
    float dist = length(v);
    vec3 dir = v / dist;
    return dot(dir, _input - start - dir * (dist + margin) * progress);
}

float falloff(float _input, float start, float end, float margin, float progress) {
    float m = margin * sign(end - start);
    float p = mix(start - m, end, progress);
    return _linstep(p + m, p, _input);
}

float falloffsmooth(float _input, float start, float end, float margin, float progress) {
    float m = margin * sign(end - start);
    float p = mix(start - m, end, progress);
    return smoothstep(p + m, p, _input);
}

float falloff(vec2 _input, vec2 start, vec2 end, float margin, float progress) {
    return _linstep(0.0, -margin, _pl(_input, start, end, margin, progress));
}

float falloffsmooth(vec2 _input, vec2 start, vec2 end, float margin, float progress) {
    return smoothstep(0.0, -margin, _pl(_input, start, end, margin, progress));
}

float falloff(vec3 _input, vec3 start, vec3 end, float margin, float progress) {
    return _linstep(0.0, -margin, _pl(_input, start, end, margin, progress));
}

float falloffsmooth(vec3 _input, vec3 start, vec3 end, float margin, float progress) {
    return smoothstep(0.0, -margin, _pl(_input, start, end, margin, progress));
}`;
}
