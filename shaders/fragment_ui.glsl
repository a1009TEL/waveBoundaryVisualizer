#version 300 es
precision mediump float;

in vec4 vColor;
out vec4 outColor;

void main() {
    float h = min(min(vColor.x, 1.0-vColor.x), min(vColor.y, 1.0-vColor.y));
    if (h > 0.005)
        discard;
    outColor = vec4(1.0, 1.0, 1.0, 1.0);
}
