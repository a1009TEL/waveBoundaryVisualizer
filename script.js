var canvas = document.getElementById("glcanvas");
var gl = canvas.getContext("webgl2");
if (!gl) {
    alert("WebGL 2 not supported");
}
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
if (gl != null)
    gl.viewport(0, 0, canvas.width, canvas.height);
// === Setup Shaders ===
var vsSource = "#version 300 es\n    layout (location = 0) in vec3 aPosition;\n    layout (location = 1) in vec2 aUV;\n    layout (location = 2) in vec4 aColor;\n    uniform mat4 uModel;\n    uniform mat4 uView;\n    uniform mat4 uProjection;\n\n    out vec4 vColor;\n\n    void main() {\n        gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);\n        //vColor = vec4(aPosition, 1.0);\n        // vColor = vec4(aUV,0,0);\n        vColor = (aColor + vec4(1.0,1.0,1.0,0.0))/2.0;\n    }\n    ";
var fsSource = "#version 300 es\n    precision mediump float;\n\n    in vec4 vColor;\n    out vec4 outColor;\n\n    void main() {\n        outColor = vColor;\n    }\n    ";
if (gl != null) {
    var vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    var program = gl.createProgram();
    if (vertexShader != null)
        gl.attachShader(program, vertexShader);
    if (fragmentShader != null)
        gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    var positions = [];
    var uvs = [];
    var colors = [];
    var indices_1 = [];
    // Create grid
    var grid_size = 100;
    var divider = (grid_size - 1);
    for (var v = 0; v < grid_size; v++) {
        for (var u = 0; u < grid_size; u++) {
            //Position
            var position_x = (u - (grid_size - 1) / 2);
            var position_y = (v - (grid_size - 1) / 2);
            var position_z = (Math.sin(position_y / 5.0) * Math.cos(position_x / 5.0));
            positions.push(position_x / divider, position_z * 0.05, position_y / divider);
            //color 
            colors.push(position_z, position_z, position_z, 1.0);
            //uv 
            var coord_u = u / (grid_size - 1);
            var coord_v = v / (grid_size - 1);
            uvs.push(coord_u, coord_v);
        }
    }
    for (var i = 0; i < grid_size * (grid_size - 1); i++) {
        if ((i + 1) % grid_size != 0) {
            var offset_up = i + grid_size;
            var offset_right = i + 1;
            var offset_up_right = i + grid_size + 1;
            indices_1.push(i, offset_up_right, offset_up, i, offset_right, offset_up_right);
        }
    }
    var positionBuffer = gl.createBuffer(); //VBO : Positions
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    var colorBuffer = gl.createBuffer(); //VBO : Color
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    var indexBuffer = gl.createBuffer(); //EBO
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_1), gl.STATIC_DRAW);
    // === VAO Setup ===
    var vao_1 = gl.createVertexArray();
    gl.bindVertexArray(vao_1);
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
    var uProjection = gl.getUniformLocation(program, "uProjection");
    var screen_divider = 1.0;
    var width_aspect = canvas.width / Math.max(canvas.width, canvas.height) / screen_divider;
    var height_aspect = canvas.height / Math.max(canvas.width, canvas.height) / screen_divider;
    var r = width_aspect / 2;
    var l = -width_aspect / 2;
    var t = height_aspect / 2;
    var b = -height_aspect / 2;
    var near_clip = 0.01;
    var far_clip = 100.0;
    // | 2/(r-l)     0          0       -(r+l)/(r-l) |
    // | 0           2/(t-b)    0       -(t+b)/(t-b) |
    // | 0           0         -2/(f-n) -(f+n)/(f-n) |
    // | 0           0          0        1           |
    var projection = new Float32Array([
        2 / (r - l), 0, 0, -(r + l) / (r - l),
        0, 2 / (t - b), 0, -(t + b) / (t - b),
        0, 0, -2 / (far_clip - near_clip), -(far_clip + near_clip) / (far_clip - near_clip),
        0, 0, 0, 1,
    ]);
    gl.uniformMatrix4fv(uProjection, false, projection);
    // Example usage:
    var position = vec3.fromValues(1, 1, 1); // camera position
    var target = vec3.fromValues(0, 0, 0); // looking at origin
    var up = vec3.fromValues(0, 1, 0); // world up
    var uView = gl.getUniformLocation(program, "uView");
    var view = lookAt(position, target, up);
    gl.uniformMatrix4fv(uView, false, view);
    var uModel = gl.getUniformLocation(program, "uModel");
    var model = new Float32Array([
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
            gl.bindVertexArray(vao_1);
            // gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
            gl.drawElements(gl.TRIANGLES, indices_1.length, gl.UNSIGNED_SHORT, 0);
        }
    }
    function animation() {
        draw();
        // requestAnimationFrame(animation);
    }
    animation();
}
