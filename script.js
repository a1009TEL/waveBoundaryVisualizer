const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// === Setup Shaders ===
const vsSource = `
  attribute vec2 aPosition;
  uniform mat4 uProjection;
  void main() {
    gl_Position = uProjection * vec4(aPosition, 0.0, 1.0);
  }
`;

const fsSource = `
  precision mediump float;
  uniform vec4 uColor;
  void main() {
    gl_FragColor = uColor;
  }
`;

function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    }
    return shader;
}

const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// === Geometry ===
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// A square tile (two triangles)
const square = [
    -0.5, -0.5, 0, -0.5, -0.5, 0,
    0.5, -0.5, 0, 0.5, -0.5, 0,
    -0.5, 0.5, 0, -0.5, 0.5, 0,
    -0.5, 0.5, 0, -0.5, 0.5, 0,
    0.5, -0.5, 0, 0.5, -0.5, 0,
    0.5, 0.5, 0, 0.5, 0.5, 0,
];

// Set up position attribute
const aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

// === Projection Matrix (Orthographic) ===
const uProjection = gl.getUniformLocation(program, "uProjection");

function ortho(left, right, bottom, top, near, far) {
    return new Float32Array([
        2 / (right - left), 0, 0, 0,
        0, 2 / (top - bottom), 0, 0,
        0, 0, -2 / (far - near), 0,
        -(right + left) / (right - left),
        -(top + bottom) / (top - bottom),
        -(far + near) / (far - near),
        1,
    ]);
}

const aspect = canvas.width / canvas.height;
const gridSize = 3;
const tileSize = 1;
const gap = 0.1;
const totalSize = gridSize * tileSize + (gridSize - 1) * gap;
const projection = ortho(
    -aspect * totalSize / 2,
    aspect * totalSize / 2,
    -totalSize / 2,
    totalSize / 2,
    -1,
    1
);
gl.uniformMatrix4fv(uProjection, false, projection);

// === Color Uniform ===
const uColor = gl.getUniformLocation(program, "uColor");

// === Tile Positions ===
const tiles = [];
for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
        const x = (col - 1) * (tileSize + gap);
        const y = (1 - row) * (tileSize + gap);
        tiles.push({ x, y, color: [0.2, 0.6, 0.9, 1] }); // blue-ish
    }
}

// === Draw Function ===
function draw() {
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const tile of tiles) {
        const transformed = square.map((v, i) =>
            i % 2 === 0 ? v + tile.x : v + tile.y
        );
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(transformed), gl.STATIC_DRAW);
        gl.uniform4fv(uColor, tile.color);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

draw();

// === Interaction ===
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / canvas.width) * 2 - 1;
    const mouseY = -(((e.clientY - rect.top) / canvas.height) * 2 - 1);

    const invProj = projection; // simple ortho — inverse is trivial
    const worldX = (mouseX * (canvas.width / canvas.height)) * (totalSize / 2);
    const worldY = mouseY * (totalSize / 2);

    for (const tile of tiles) {
        if (
            worldX > tile.x - tileSize / 2 &&
            worldX < tile.x + tileSize / 2 &&
            worldY > tile.y - tileSize / 2 &&
            worldY < tile.y + tileSize / 2
        ) {
            tile.color = [0.2, 0.9, 0.1, 1]; // green on click
            break;
        }
    }

    draw();
});
