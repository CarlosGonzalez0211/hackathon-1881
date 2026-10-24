/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1136752:1139832.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1664(scope) {
scope.matrixutils_default = `vec3 getMatrixTranslation(mat4 mat) {
    return vec3(mat[3]);
}

void setMatrixTranslation(inout mat4 mat, vec3 translation) {
    mat[3].xyz = translation;
}

vec3 getMatrixScale(mat4 mat) {
    vec3 scale = vec3(length(mat[0].xyz), length(mat[1].xyz), length(mat[2].xyz));
    return determinant(mat) < 0.0 ? vec3(-scale.x, scale.yz) : scale;
}

void setMatrixScale(inout mat4 mat, vec3 scale) {
    vec3 invScale = 1.0 / getMatrixScale(mat);
    mat[0] *= invScale.x * scale.x;
    mat[1] *= invScale.y * scale.y;
    mat[2] *= invScale.z * scale.z;
}

mat4 getMatrixRotation(mat4 mat) {
    mat4 m = mat4(1.0);
    vec3 scale = getMatrixScale(mat);
    m[0] = mat[0] / scale.x;
    m[1] = mat[1] / scale.y;
    m[2] = mat[2] / scale.z;
    return m;
}

void setMatrixRotation(inout mat4 mat, vec3 rotation) {
    vec3 scale = getMatrixScale(mat);

    float x = rotation.x, y = rotation.y, z = rotation.z;
    float a = cos(x), b = sin(x);
    float c = cos(y), d = sin(y);
    float e = cos(z), f = sin(z);

    
    float ae = a * e, af = a * f, be = b * e, bf = b * f;
    mat[0].xyz = vec3(c * e, -c * f, d) * scale.x;
    mat[1].xyz = vec3(af + be * d, ae - bf * d, -b * c) * scale.y;
    mat[2].xyz = vec3(bf - ae * d, be + af * d, a * c) * scale.z;
}

void matrixCompose(inout mat4 mat, vec3 translation, vec4 quaternion, vec3 scale) {
    float x = quaternion.x; float y = quaternion.y; float z = quaternion.z; float w = quaternion.w;
    float x2 = x + x; float y2 = y + y; float z2 = z + z;
    float xx = x * x2; float xy = x * y2; float xz = x * z2;
    float yy = y * y2; float yz = y * z2; float zz = z * z2;
    float wx = w * x2; float wy = w * y2; float wz = w * z2;
    float sx = scale.x; float sy = scale.y; float sz = scale.z;
    mat[0] = vec4((1.0 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0.0);
    mat[1] = vec4((xy - wz) * sy, (1.0 - (xx + zz)) * sy, (yz + wx) * sy, 0.0);
    mat[2] = vec4((xz + wy) * sz, (yz - wx) * sz, (1.0 - (xx + yy)) * sz, 0.0);
    mat[3] = vec4(translation.xyz, 1.0);
}

vec3 getViewRight() {
    return vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
}

vec3 getViewLeft() {
    return -getViewRight();
}

vec3 getViewUp() {
    return vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
}

vec3 getViewDown() {
    return -getViewUp();
}

vec3 getViewBack() {
    return vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
}

vec3 getViewForward() {
    return -getViewBack();
}

mat4 billBoardMatrix(mat4 mat) {
    mat4 m = mat4(1.0);
    vec3 scale = getMatrixScale(mat);
    m[0].xyz = getViewRight() * scale.x;
    m[1].xyz = getViewUp() * scale.y;
    m[2].xyz = getViewBack() * scale.z;
    m[3].xyz = getMatrixTranslation(mat);
    return m;
}

mat4 billboardModelMatrix(vec3 offset) {
    mat4 m = billBoardMatrix(modelMatrix);
    setMatrixTranslation(m, offset);
    return m;
}

mat4 billboardModelMatrix() {
    return billBoardMatrix(modelMatrix);
}`;
}
