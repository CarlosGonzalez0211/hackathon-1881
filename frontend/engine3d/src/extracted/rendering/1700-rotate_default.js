/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1210163:1212216.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1700(scope) {
scope.rotate_default = `mat2 rotation2D(float angle) {
    float s = sin(angle);
	float c = cos(angle);
	return mat2(c, s, -s, c);
}

vec2 rotate2D(vec2 v, float angle) {
	return rotation2D(angle) * v;
}

mat3 rotateX(float angle) {
    float s = sin(angle);
	float c = cos(angle);

	return mat3(
		1.0, 0.0, 0.0,
		0.0, c, s,
		0.0, -s, c
	);
}

mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);

    return mat3(
		c, 0.0, -s,
		0.0, 1.0, 0.0,
		s, 0.0, c
	);
}

mat3 rotateZ(float angle) {
    float c = cos(angle);
    float s = sin(angle);

    return mat3(
		c, s, 0.0,
		-s, c, 0.0,
		0.0, 0.0, 1.0
	);
}

mat4 rotation3D(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,  0.0,
                0.0, 0.0, 0.0, 1.0);
}

vec3 rotate3D(vec3 v, vec3 axis, float angle) {
	mat4 m = rotation3D(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

vec3 applyQuat(vec3 vec, vec4 quat) {
    vec3 t = 2.0 * cross(quat.xyz, vec);
    return vec + quat.w * t + cross(quat.xyz, t);
}

vec4 quatNormalize(vec4 q) {
    float len = length(q);
    if (len == 0.0) return vec4(vec3(0.0), 1.0);
    return q / len;
}

vec4 quatFromAxisAngle(vec3 axis, float angle) {
	float sn = sin(angle * 0.5);
	float cs = cos(angle * 0.5);
	return vec4(axis * sn, cs);
}

vec4 quatFromUnitVectors(vec3 v1, vec3 v2) {
    float r = dot(v1, v2) + 1.0;
    if (r < 1e-6) return quatNormalize(abs(v1.x) > abs(v1.z) ? vec4(-v1.y, v1.x, 0.0, 0.0) : vec4(0.0, -v1.z, v1.y, 0.0));
    
    vec4 q = vec4(cross(v1, v2), r);
    return q / length(q);
}`;
}
