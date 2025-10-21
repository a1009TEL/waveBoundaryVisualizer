const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");

if (!gl) {
    alert("WebGL 2 not supported");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
if (gl != null)
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
        gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
        //vColor = vec4(aPosition, 1.0);
        // vColor = vec4(aUV,0,0);
        vColor = (aColor + vec4(1.0,1.0,1.0,0.0))/2.0;
    }
    `;

const fsSource = `#version 300 es
    precision mediump float;

    in vec4 vColor;
    out vec4 outColor;

    void main() {
        outColor = vColor;
    }
    `;

if (gl != null) {
    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    if (vertexShader != null)
        gl.attachShader(program, vertexShader);
    if (fragmentShader != null)
        gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positions: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Create grid
    let grid_size = 100;
    let divider = (grid_size - 1);
    for (let v = 0; v < grid_size; v++) {
        for (let u = 0; u < grid_size; u++) {
            //Position
            const position_x = (u - (grid_size - 1) / 2);
            const position_y = (v - (grid_size - 1) / 2);
            const position_z = (Math.sin(position_y / 5.0) * Math.cos(position_x / 5.0));
            positions.push(position_x / divider, position_z * 0.05, position_y / divider);

            //color 
            colors.push(position_z, position_z, position_z, 1.0);

            //uv 
            const coord_u = u / (grid_size - 1);
            const coord_v = v / (grid_size - 1);
            uvs.push(coord_u, coord_v);
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

    let screen_divider = 1.0;
    let width_aspect = canvas.width / Math.max(canvas.width, canvas.height) / screen_divider;
    let height_aspect = canvas.height / Math.max(canvas.width, canvas.height) / screen_divider;
    let r = width_aspect / 2;
    let l = -width_aspect / 2;
    let t = height_aspect / 2;
    let b = -height_aspect / 2;
    let near_clip = 0.01;
    let far_clip = 100.0;
    // | 2/(r-l)     0          0       -(r+l)/(r-l) |
    // | 0           2/(t-b)    0       -(t+b)/(t-b) |
    // | 0           0         -2/(f-n) -(f+n)/(f-n) |
    // | 0           0          0        1           |
    const projection = new Float32Array([
        2 / (r - l), 0, 0, -(r + l) / (r - l),
        0, 2 / (t - b), 0, -(t + b) / (t - b),
        0, 0, -2 / (far_clip - near_clip), - (far_clip + near_clip) / (far_clip - near_clip),
        0, 0, 0, 1,
    ]);
    gl.uniformMatrix4fv(uProjection, false, projection);


    // Example usage:
    const position = vec3.fromValues(1, 1, 1);   // camera position
    const target = vec3.fromValues(0, 0, 0);     // looking at origin
    const up = vec3.fromValues(0, 1, 0);         // world up

    const uView = gl.getUniformLocation(program, "uView");
    const view = lookAt(position, target, up);
    gl.uniformMatrix4fv(uView, false, view);

    const uModel = gl.getUniformLocation(program, "uModel");

    const model = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
    gl.uniformMatrix4fv(uModel, false, model);


    gl.clearColor(.1, .1, .1, 1); //gray
    // gl.clearColor(1, 0, 1, 1); //magneta

    function draw() {
        if (gl != null) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            //draw
            gl.bindVertexArray(vao);
            // gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        }
    }

    function animation() {
        draw();
        // requestAnimationFrame(animation);
    }

    animation()
}
