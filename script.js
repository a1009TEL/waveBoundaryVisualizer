const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    alert("WebGL 2 not supported");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

// === Setup Shaders ===
const vsSource = `#version 300 es
    layout (location = 0) in vec3 aPosition;
    layout (location = 1) in vec2 aUV;
    layout (location = 2) in vec4 aColor;
    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;

    out vec4 vColor;

    void main() {
        gl_Position = uProjection * vec4(aPosition, 1.0);
        vColor = vec4(aPosition, 0);
    }
`;

const fsSource = `#version 300 es
    precision mediump float;

    in vec4 vColor;
    out vec4 outColor;

    void main() {
        outColor = vec4(1,1,1,1);
    }
`;

const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const positions = [];
const uvs = [];
const colors = [];
const indices = [];

// Create grid
let grid_size = 3;
for (let v = 0; v < grid_size; v++) {
    for (let u = 0; u < grid_size; u++) {
        positions.push(u / 10.0, v / 10.0, 0.0);
    }
}

for (let i = 0; i < grid_size * (grid_size - 1); i++) {
    if ((i + 1) % grid_size != 0) {
        const offset_up = i + grid_size;
        const offset_right = i + 1
        const offset_up_right = i + grid_size + 1;

        indices.push(i, offset_up_right, offset_up, i, offset_right, offset_up_right);
    }
}

console.log(positions);
console.log(indices);


const positionBuffer = gl.createBuffer(); //VBO : Positions
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer(); //VBO : Color
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer(); //EBO
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// === VAO Setup ===
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// VBO: already bound
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.enableVertexAttribArray(2);
gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

// EBO: must be bound AFTER binding VAO
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

// Done configuring
gl.bindVertexArray(null);

// === Projection Matrix (Orthographic) ===
const uProjection = gl.getUniformLocation(program, "uProjection");
const projection = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
]);
gl.uniformMatrix4fv(uProjection, false, projection);

gl.clearColor(.1, .1, .1, 1); //gray
// gl.clearColor(1, 0, 1, 1); //magneta
function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    //draw
    gl.bindVertexArray(vao);
    // gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function animation() {
    draw();
    // requestAnimationFrame(animation);
}

animation()
