#version 300 es
precision mediump float;

in vec4 vColor;
out vec4 outColor;

uniform sampler2D uColorMap;
uniform int uColorMapIndex;

uniform float uTWaveAlpha;

void main() {
    float lerp_variable = vColor.x * 0.7;
    float red_white = mix(0.5, 1.0, lerp_variable);
    float white_blue = mix(0.5, 0.0, -lerp_variable);

    vec4 color = texture(uColorMap, vec2(mix(red_white, white_blue, step(lerp_variable, 0.0)), (float(uColorMapIndex)+0.5) / 15.0));
    float alpha = mix(1.0, uTWaveAlpha, step(0.0, vColor.y));

    outColor = vec4(color.x, color.y, color.z, alpha);
    // outColor = vec4(gl_FragCoord.w, 0.0,0.0,0.0);
    // outColor = vec4(1.0,1.0,1.0,0.1);
}
