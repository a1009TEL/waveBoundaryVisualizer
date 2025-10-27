import { gl } from "./canvas.js";
const default_vertex = `#version 300 es
    layout (location = 0) in vec3 aPosition;
    layout (location = 1) in vec3 aNormal;
    layout (location = 2) in vec2 aUV;
    layout (location = 3) in vec4 aColor;

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;

    out vec4 vColor;

    void main() {
        gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
        vColor = vec4(aUV, 0.0, 1.0);
    }
    `;
const default_fragment = `#version 300 es
    precision mediump float;

    in vec4 vColor;
    out vec4 outColor;

    void main() {
        outColor = vColor;
    }
    `;
function createShader(type, source) {
    const shader = gl?.createShader(type);
    if (shader) {
        gl?.shaderSource(shader, source);
        gl?.compileShader(shader);
        if (!gl?.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader compile error:", gl?.getShaderInfoLog(shader));
        }
        return shader;
    }
    else {
        alert("ERROR : Shader compilation error, shader is null");
    }
}
async function loadShader(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            console.error(`Failed to load shader: ${response.status} ${response.statusText}`);
            return null;
        }
        const text = await response.text();
        return text ?? null;
    }
    catch (err) {
        console.error(`Error fetching shader:`, err);
        return null;
    }
}
export class Shader {
    constructor(vertex_path, fragment_path) {
        this.vertex_src = "";
        this.fragment_src = "";
        this.program = null;
        this.initShader(vertex_path, fragment_path);
    }
    use() {
        gl?.useProgram(this.program);
    }
    ready() {
        return this.program != null;
    }
    async initShader(vertex_path, fragment_path) {
        this.vertex_src = (await loadShader(vertex_path)) ?? default_vertex;
        this.fragment_src = (await loadShader(fragment_path)) ?? default_fragment;
        const vertexShader = createShader(gl?.VERTEX_SHADER, this.vertex_src);
        const fragmentShader = createShader(gl?.FRAGMENT_SHADER, this.fragment_src);
        this.program = gl?.createProgram() ?? null;
        if (this.program) {
            if (vertexShader != null)
                gl?.attachShader(this.program, vertexShader);
            if (fragmentShader != null)
                gl?.attachShader(this.program, fragmentShader);
            gl?.linkProgram(this.program);
        }
    }
    setUniform1b(uniform_name, value) {
        if (this.program) {
            this.use();
            const uniform = gl?.getUniformLocation(this.program, uniform_name);
            if (uniform != null) {
                gl?.uniform1i(uniform, value ? 1 : 0);
            }
        }
        gl?.useProgram(null);
    }
    setUniform1i(uniform_name, value) {
        if (this.program) {
            this.use();
            const uniform = gl?.getUniformLocation(this.program, uniform_name);
            if (uniform != null) {
                gl?.uniform1i(uniform, value);
            }
        }
        gl?.useProgram(null);
    }
    setUniform1f(uniform_name, value) {
        if (this.program) {
            this.use();
            const uniform = gl?.getUniformLocation(this.program, uniform_name);
            if (uniform != null) {
                gl?.uniform1f(uniform, value);
            }
        }
        gl?.useProgram(null);
    }
    setUniform2f(uniform_name, value1, value2) {
        if (this.program) {
            this.use();
            const uniform = gl?.getUniformLocation(this.program, uniform_name);
            if (uniform != null) {
                gl?.uniform2f(uniform, value1, value2);
            }
        }
        gl?.useProgram(null);
    }
    setUniform3f(uniform_name, value1, value2, value3) {
        if (this.program) {
            this.use();
            const uniform = gl?.getUniformLocation(this.program, uniform_name);
            if (uniform != null) {
                gl?.uniform3f(uniform, value1, value2, value3);
            }
        }
        gl?.useProgram(null);
    }
    setUniformMatrix4fv(uniform_name, value) {
        if (this.program) {
            this.use();
            const uniform = gl?.getUniformLocation(this.program, uniform_name);
            if (uniform != null) {
                gl?.uniformMatrix4fv(uniform, false, value);
            }
        }
        gl?.useProgram(null);
    }
}
