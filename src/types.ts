export interface Float2 {
    x: number,
    y: number,
}

export interface Float3 {
    x: number,
    y: number,
    z: number,
}

export interface Float4 {
    x: number,
    y: number,
    z: number,
    w: number,
}

export type Position = Float3;
export type Normal = Float3;
export type TexCoord = Float2;
export type Color = Float4;

// Factory functions to create vector objects
export function float2(x: number, y: number): Float2 {
    return { x, y };
}

export function float3(x: number, y: number, z: number): Float3 {
    return { x, y, z };
}

export function float4(x: number, y: number, z: number, w: number): Float4 {
    return { x, y, z, w };
}

//Math
// Add two 2D vectors
export function add2(v1: Float2, v2: Float2): Float2 {
    return float2(v1.x + v2.x, v1.y + v2.y);
}

// Add two 3D vectors
export function add3(v1: Float3, v2: Float3): Float3 {
    return float3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}

// Add two 4D vectors
export function add4(v1: Float4, v2: Float4): Float4 {
    return float4(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, v1.w + v2.w);
}

// Subtract two 2D vectors
export function subtract2(v1: Float2, v2: Float2): Float2 {
    return float2(v1.x - v2.x, v1.y - v2.y);
}

// Subtract two 3D vectors
export function subtract3(v1: Float3, v2: Float3): Float3 {
    return float3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}

// Subtract two 4D vectors
export function subtract4(v1: Float4, v2: Float4): Float4 {
    return float4(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z, v1.w - v2.w);
}

// Multiply two 2D vectors element-wise
export function multiply2(v1: Float2, v2: Float2): Float2 {
    return float2(v1.x * v2.x, v1.y * v2.y);
}

// Multiply two 3D vectors element-wise
export function multiply3(v1: Float3, v2: Float3): Float3 {
    return float3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
}

// Multiply two 4D vectors element-wise
export function multiply4(v1: Float4, v2: Float4): Float4 {
    return float4(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z, v1.w * v2.w);
}

// Scalar multiply a 2D vector
export function scale2(v: Float2, s: number): Float2 {
    return float2(v.x * s, v.y * s);
}

// Scalar multiply a 3D vector
export function scale3(v: Float3, s: number): Float3 {
    return float3(v.x * s, v.y * s, v.z * s);
}

// Scalar multiply a 4D vector
export function scale4(v: Float4, s: number): Float4 {
    return float4(v.x * s, v.y * s, v.z * s, v.w * s);
}

// Divide two 2D vectors element-wise
export function divide2(v1: Float2, v2: Float2): Float2 {
    return float2(v1.x / v2.x, v1.y / v2.y);
}

// Divide two 3D vectors element-wise
export function divide3(v1: Float3, v2: Float3): Float3 {
    return float3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
}

// Divide two 4D vectors element-wise
export function divide4(v1: Float4, v2: Float4): Float4 {
    return float4(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z, v1.w / v2.w);
}

// -----------------------------
// Vector Operations (Dot and Cross)

// Dot product of two 2D vectors
export function dot2(v1: Float2, v2: Float2): number {
    return v1.x * v2.x + v1.y * v2.y;
}

// Dot product of two 3D vectors
export function dot3(v1: Float3, v2: Float3): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

// Dot product of two 4D vectors
export function dot4(v1: Float4, v2: Float4): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
}

// Cross product of two 3D vectors
export function cross3(v1: Float3, v2: Float3): Float3 {
    return float3(
        v1.y * v2.z - v1.z * v2.y, // X
        v1.z * v2.x - v1.x * v2.z, // Y
        v1.x * v2.y - v1.y * v2.x  // Z
    );
}

// -----------------------------
// Other Vector Operations

// Normalize a 2D vector
export function normalize2(v: Float2): Float2 {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    if (length === 0) return float2(0, 0); // Prevent division by zero
    return float2(v.x / length, v.y / length);
}

// Normalize a 3D vector
export function normalize3(v: Float3): Float3 {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length === 0) return float3(0, 0, 0); // Prevent division by zero
    return float3(v.x / length, v.y / length, v.z / length);
}

// Normalize a 4D vector
export function normalize4(v: Float4): Float4 {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w);
    if (length === 0) return float4(0, 0, 0, 0); // Prevent division by zero
    return float4(v.x / length, v.y / length, v.z / length, v.w / length);
}

// Length of a 2D vector
export function length2(v: Float2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

// Length of a 3D vector
export function length3(v: Float3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

// Length of a 4D vector
export function length4(v: Float4): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w);
}

// Absolute value of a 2D vector
export function abs2(v: Float2): Float2 {
    return float2(Math.abs(v.x), Math.abs(v.y));
}

// Absolute value of a 3D vector
export function abs3(v: Float3): Float3 {
    return float3(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
}

// Absolute value of a 4D vector
export function abs4(v: Float4): Float4 {
    return float4(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z), Math.abs(v.w));
}
