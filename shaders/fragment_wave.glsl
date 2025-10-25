#version 300 es
precision mediump float;

in vec4 vColor;
out vec4 outColor;

void main() {
    outColor = vColor;
    // outColor = vec4(gl_FragCoord.w, 0.0,0.0,0.0);
    // outColor = vec4(1.0,1.0,1.0,0.1);
}
