import * as Types from "./types.js";
export function getColorMapIndex(name) {
    const map = {
        PiYG: 0,
        PRGn: 1,
        BrBG: 2,
        PuOr: 3,
        RdGy: 4,
        RdBu: 5,
        RdTlBu: 6,
        RdTlGn: 7,
        Spectral: 8,
        coolwarm: 9,
        bwr: 10,
        seismic: 11,
        berlin: 12,
        managua: 13,
        vanimo: 14
    };
    return map[name] ?? 5; //default
}
export function bezier3(p0, p1, p2, p3, t) {
    const a0 = ((1 - t) ** 3);
    const a1 = 3 * ((1 - t) ** 2) * t;
    const a2 = 3 * (1 - t) * (t ** 2);
    const a3 = (t ** 3);
    const x = a0 * p0.x + a1 * p1.x + a2 * p2.x + a3 * p3.x;
    const y = a0 * p0.y + a1 * p1.y + a2 * p2.y + a3 * p3.y;
    const z = a0 * p0.z + a1 * p1.z + a2 * p2.z + a3 * p3.z;
    return { x, y, z };
}
export function smoothStep(t) {
    if (t > 1) {
        return 1;
    }
    else if (t < 0) {
        return 0;
    }
    else {
        return -2 * (t ** 3) + 3 * (t ** 2);
    }
}
// https://glmatrix.net/docs/mat4.js.html#line1740
export function lookAt(eye, center, up) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    let eyex = eye.x;
    let eyey = eye.y;
    let eyez = eye.z;
    let upx = up.x;
    let upy = up.y;
    let upz = up.z;
    let centerx = center.x;
    let centery = center.y;
    let centerz = center.z;
    const EPSILON = 0.000001;
    if (Math.abs(eyex - centerx) < EPSILON &&
        Math.abs(eyey - centery) < EPSILON &&
        Math.abs(eyez - centerz) < EPSILON) {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
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
    }
    else {
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
    }
    else {
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
export function lookAtRH(eye, center, up) {
    const f = (Types.normalize3(Types.subtract3(center, eye)));
    const s = Types.normalize3(Types.cross3(f, up));
    const u = Types.cross3(s, f);
    let result = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
    // [ s.x   u.x   -f.x   0 ]
    // [ s.y   u.y   -f.y   0 ]
    // [ s.z   u.z   -f.z   0 ]
    // [ -dot(s, eye)  -dot(u, eye)  dot(f, eye)  1 ]
    // 0  1  2  3
    // 4  5  6  7
    // 8  9  10 11
    // 12 13 14 15
    result[0] = s.x;
    result[4] = s.y;
    result[8] = s.z;
    result[1] = u.x;
    result[5] = u.y;
    result[9] = u.z;
    result[3] = -f.x;
    result[7] = -f.y;
    result[11] = -f.z;
    result[12] = -Types.dot3(s, eye);
    result[13] = -Types.dot3(u, eye);
    result[14] = Types.dot3(f, eye);
    // result[0] = s.x;
    // result[1] = s.y;
    // result[2] = s.z;
    // result[4] = u.x;
    // result[5] = u.y;
    // result[6] = u.z;
    // result[8] = -f.x;
    // result[9] = -f.y;
    // result[10] = -f.z;
    // result[3] = -Types.dot3(s, eye);
    // result[7] = -Types.dot3(u, eye);
    // result[11] = Types.dot3(f, eye);
    return new Float32Array(result);
}
export function ortho(width_aspect, height_aspect, near_clip, far_clip) {
    const r = width_aspect / 2;
    const l = -width_aspect / 2;
    const t = height_aspect / 2;
    const b = -height_aspect / 2;
    const projection = new Float32Array([
        2 / (r - l), 0, 0, -(r + l) / (r - l),
        0, 2 / (t - b), 0, -(t + b) / (t - b),
        0, 0, -2 / (far_clip - near_clip), -(far_clip + near_clip) / (far_clip - near_clip),
        0, 0, 0, 1,
    ]);
    return projection;
}
