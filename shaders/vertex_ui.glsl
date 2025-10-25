#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aUV;
layout (location = 3) in vec4 aColor;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

out vec4 vColor;

void main() {
    vColor = vec4(aUV, 0.0, 1.0);
    gl_Position = uProjection * uView * uModel * vec4(aPosition / 2.0, 1.0);
}
