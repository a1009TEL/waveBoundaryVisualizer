import { gl } from "./canvas.js";
import { initTexture } from "./images.js";
export class Mesh {
    constructor(vertices, indices) {
        this.vertices = vertices;
        this.indices = indices;
        this.vao = gl?.createVertexArray() ?? null;
        this.position_buffer = gl?.createBuffer() ?? null;
        this.normal_buffer = gl?.createBuffer() ?? null;
        this.uv_buffer = gl?.createBuffer() ?? null;
        this.color_buffer = gl?.createBuffer() ?? null;
        this.ebo = gl?.createBuffer() ?? null;
        this.textures = [];
        this.setupMesh();
    }
    loadImages(image_path) {
        const image = new Image();
        image.onload = () => {
            const texture = initTexture(image) ?? 0.0;
            this.textures.push(texture);
        };
        image.src = image_path;
    }
    draw(shader) {
        if (shader.ready()) {
            shader.use();
            gl?.bindVertexArray(this.vao);
            gl?.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
        }
    }
    getTexture(n) {
        return this.textures[n];
    }
    setupMesh() {
        // Position
        gl?.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
        const position_data = new Float32Array(this.vertices.position.flatMap(v => [v.x, v.y, v.z]));
        gl?.bufferData(gl.ARRAY_BUFFER, position_data, gl.STATIC_DRAW);
        // Normal
        gl?.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
        const normal_data = new Float32Array(this.vertices.normal.flatMap(v => [v.x, v.y, v.z]));
        gl?.bufferData(gl.ARRAY_BUFFER, normal_data, gl.STATIC_DRAW);
        // UV
        gl?.bindBuffer(gl.ARRAY_BUFFER, this.uv_buffer);
        const uv_data = new Float32Array(this.vertices.uv.flatMap(v => [v.x, v.y]));
        gl?.bufferData(gl.ARRAY_BUFFER, uv_data, gl.STATIC_DRAW);
        // Color
        gl?.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
        const color_data = new Float32Array(this.vertices.color.flatMap(v => [v.x, v.y, v.z, v.w]));
        gl?.bufferData(gl.ARRAY_BUFFER, color_data, gl.STATIC_DRAW);
        // Index
        gl?.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl?.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl?.bindVertexArray(this.vao);
        gl?.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
        gl?.enableVertexAttribArray(0);
        gl?.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl?.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
        gl?.enableVertexAttribArray(1);
        gl?.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl?.bindBuffer(gl.ARRAY_BUFFER, this.uv_buffer);
        gl?.enableVertexAttribArray(2);
        gl?.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
        gl?.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
        gl?.enableVertexAttribArray(3);
        gl?.vertexAttribPointer(3, 4, gl.FLOAT, false, 0, 0);
        gl?.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl?.bindVertexArray(null);
    }
}
