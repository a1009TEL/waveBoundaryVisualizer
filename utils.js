function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    }
    return shader;
}

const { vec3, mat4 } = glMatrix;

// function lookAtMatrix(position, target, worldUp) {
//     // Create vectors
//     const zaxis = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), position, target));
//     const xaxis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), vec3.normalize(vec3.create(), worldUp), zaxis));
//     const yaxis = vec3.cross(vec3.create(), zaxis, xaxis);
//
//     // Create rotation matrix
//     const rotation = mat4.create();
//     rotation[0] = xaxis[0];
//     rotation[1] = xaxis[1];
//     rotation[2] = xaxis[2];
//
//     rotation[4] = yaxis[0];
//     rotation[5] = yaxis[1];
//     rotation[6] = yaxis[2];
//
//     rotation[8] = zaxis[0];
//     rotation[9] = zaxis[1];
//     rotation[10] = zaxis[2];
//
//     // Create translation matrix
//     const translation = mat4.create();
//     mat4.translate(translation, translation, vec3.negate(vec3.create(), position));
//
//     // Combine rotation and translation
//     const view = mat4.create();
//     mat4.multiply(view, rotation, translation);
//
//     return view;
// }

// https://glmatrix.net/docs/mat4.js.html#line1740
function lookAt(eye, center, up) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    let eyex = eye[0];
    let eyey = eye[1];
    let eyez = eye[2];
    let upx = up[0];
    let upy = up[1];
    let upz = up[2];
    let centerx = center[0];
    let centery = center[1];
    let centerz = center[2];
    if (
        Math.abs(eyex - centerx) < glMatrix.EPSILON &&
        Math.abs(eyey - centery) < glMatrix.EPSILON &&
        Math.abs(eyez - centerz) < glMatrix.EPSILON
    ) {
        return identity(out);
    }
    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }
    let out = new Float32Array([
        x0, y0, z0, 0,
        x1, y1, z1, 0,
        x2, y2, z2, 0,
        -(x0 * eyex + x1 * eyey + x2 * eyez),
        -(y0 * eyex + y1 * eyey + y2 * eyez),
        -(z0 * eyex + z1 * eyey + z2 * eyez),
        1,
    ]);
    return out;
}


// function lookAtMatrix(position, target, worldUp) {
//     const zaxis = vec3.normalize(vec3.subtract(position, target)); // camera direction
//     const xaxis = vec3.normalize(vec3.cross(worldUp, zaxis)); // right vector
//     const yaxis = vec3.cross(zaxis, xaxis); // up vector
//
//     // Construct rotation matrix (column-major)
//     const rotation = [
//         xaxis[0], yaxis[0], zaxis[0], 0,
//         xaxis[1], yaxis[1], zaxis[1], 0,
//         xaxis[2], yaxis[2], zaxis[2], 0,
//         0, 0, 0, 1,
//     ];
//
//     // Construct translation matrix
//     const translation = [
//         1, 0, 0, 0,
//         0, 1, 0, 0,
//         0, 0, 1, 0,
//         -position[0], -position[1], -position[2], 1,
//     ];
//
//     return multiplyMatrices(rotation, translation);
// }
