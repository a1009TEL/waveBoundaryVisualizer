var canvas = document.getElementById("glcanvas");
var gl = canvas.getContext("webgl2", { alpha: true });
if (!gl) {
    alert("WebGL 2 not supported");
}
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
if (gl != null) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}
// === Setup Shaders ===
var vsSource = "#version 300 es\n    layout (location = 0) in vec3 aPosition;\n    layout (location = 1) in vec2 aUV;\n    layout (location = 2) in vec4 aColor;\n    uniform mat4 uModel;\n    uniform mat4 uView;\n    uniform mat4 uProjection;\n\n    uniform float uTime;\n\n    uniform float uTWaveAlpha;\n    uniform float uAmplitudeScaling;\n    uniform float uTimeZoom;\n    uniform float uSpaceZoom;\n\n    uniform float uOmega;\n    uniform float uBeta;\n    uniform float uTheta;\n    uniform float uEta1;\n    uniform float uEta2;\n\n    out vec4 vColor;\n\n    void main() {\n        float time_scaling = uOmega / uTimeZoom;\n        float space_scaling = uBeta / uSpaceZoom;\n\n        float eta1 = uEta1;\n        float eta2 = uEta2;\n        float incident_angle = uTheta;\n\n        float transmited_angle = asin(sin(incident_angle) * eta2/eta1);\n\n        float incident_axis = dot(vec3(sin(incident_angle), 0.0, cos(incident_angle)), aPosition);\n        float reflected_axis = dot(vec3(sin(incident_angle), 0.0, -cos(incident_angle)), aPosition);\n        float transmited_axis = dot(vec3(sin(transmited_angle), 0.0, cos(transmited_angle)), aPosition) / (eta2 / eta1);\n\n        float incident_amplitude = 2.0/space_scaling;\n        float reflected_amplitude = (eta2*cos(incident_angle)-eta1*cos(transmited_angle))/(eta2*cos(incident_angle)+eta1*cos(transmited_angle)) * incident_amplitude;\n        float transmited_amplitude = (2.0*eta2*cos(incident_angle))/(eta2*cos(incident_angle)+eta1*cos(transmited_angle)) * incident_amplitude;\n\n        float incident = sin(incident_axis*space_scaling-uTime*time_scaling)*incident_amplitude;\n        float reflected = sin(reflected_axis*space_scaling-uTime*time_scaling)*reflected_amplitude;\n        float transmited = sin(transmited_axis*space_scaling-uTime*time_scaling)*transmited_amplitude;\n\n        float pos_y = mix(incident + reflected, transmited, aPosition.z > 0.0);\n\n        vec3 red_white = mix(vec3(1.0,1.0,1.0), vec3(1.0,0.0,0.0), pos_y/incident_amplitude);\n        vec3 white_blue = mix(vec3(1.0,1.0,1.0), vec3(0.0,0.0,1.0), -pos_y/incident_amplitude);\n        vec3 color_map = mix(red_white, white_blue, step(pos_y, 0.0));\n        vec4 color_map_alpha = mix(vec4(color_map, uTWaveAlpha), vec4(color_map, 1.0), step(aPosition.z, 0.0));\n\n\n        vColor = color_map_alpha;\n        gl_Position = uProjection * uView * uModel * vec4(aPosition.x, pos_y * uAmplitudeScaling, aPosition.z, 1.0);\n        // vColor = vec4(aPosition,1.0);\n        // vColor = vec4(aUV, 0,0.0);\n    }\n    ";
var fsSource = "#version 300 es\n    precision mediump float;\n\n    in vec4 vColor;\n    out vec4 outColor;\n\n    void main() {\n        outColor = vColor;\n        // outColor = vec4(gl_FragCoord.w, 0.0,0.0,0.0);\n        // outColor = vec4(1.0,1.0,1.0,0.1);\n    }\n    ";
if (gl != null) {
    var vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    var program_1 = gl.createProgram();
    if (vertexShader != null)
        gl.attachShader(program_1, vertexShader);
    if (fragmentShader != null)
        gl.attachShader(program_1, fragmentShader);
    gl.linkProgram(program_1);
    gl.useProgram(program_1);
    var positions = [];
    var uvs = [];
    var colors = [];
    var indices_1 = [];
    // Create grid
    var grid_size = 200;
    var divider = (grid_size - 1);
    for (var v = 0; v < grid_size; v++) {
        for (var u = 0; u < grid_size; u++) {
            //Position
            var position_x = (u - (grid_size - 1) / 2);
            var position_y = (v - (grid_size - 1) / 2);
            positions.push(position_x / divider, 0.0, position_y / divider);
            //uv 
            var coord_u = u / divider;
            var coord_v = v / divider;
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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices_1), gl.STATIC_DRAW);
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
    //----------------------------------------------------------------------
    gl.clearColor(.1, .1, .1, 1); //gray
    // gl.clearColor(1, 0, 1, 1); //magneta
    function update(time) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        if (gl != null) {
            var uProjection = gl.getUniformLocation(program_1, "uProjection");
            var uView = gl.getUniformLocation(program_1, "uView");
            var uModel = gl.getUniformLocation(program_1, "uModel");
            var uTime = gl.getUniformLocation(program_1, "uTime");
            var uTWaveAlpha = gl.getUniformLocation(program_1, "uTWaveAlpha");
            var uAmplitudeScaling = gl.getUniformLocation(program_1, "uAmplitudeScaling");
            var uTimeZoom = gl.getUniformLocation(program_1, "uTimeZoom");
            var uSpaceZoom = gl.getUniformLocation(program_1, "uSpaceZoom");
            var uOmega = gl.getUniformLocation(program_1, "uOmega");
            var uBeta = gl.getUniformLocation(program_1, "uBeta");
            var uTheta = gl.getUniformLocation(program_1, "uTheta");
            var uEta1 = gl.getUniformLocation(program_1, "uEta1");
            var uEta2 = gl.getUniformLocation(program_1, "uEta2");
            var screen_divider = 1.0;
            var width_aspect = canvas.width / Math.max(canvas.width, canvas.height) / screen_divider;
            var height_aspect = canvas.height / Math.max(canvas.width, canvas.height) / screen_divider;
            var r = width_aspect / 2;
            var l = -width_aspect / 2;
            var t = height_aspect / 2;
            var b = -height_aspect / 2;
            var near_clip = 0.01;
            var far_clip = 100.0;
            var projection = new Float32Array([
                2 / (r - l), 0, 0, -(r + l) / (r - l),
                0, 2 / (t - b), 0, -(t + b) / (t - b),
                0, 0, -2 / (far_clip - near_clip), -(far_clip + near_clip) / (far_clip - near_clip),
                0, 0, 0, 1,
            ]);
            // bezier position
            var p0 = [0.0, 1.0, 0.0];
            var p1 = [-0.75, 0.85, 0.25];
            var p2 = [-0.85, 0.81, 0.5];
            var p3 = [-1.0, 0.8, 0.75];
            var camera_lerp = (_b = (_a = control_panel_items.camera_pos) === null || _a === void 0 ? void 0 : _a.valueAsNumber) !== null && _b !== void 0 ? _b : 1.0;
            var position = bezier3(p0, p1, p2, p3, camera_lerp); // camera position
            var target = new Float32Array([0, 0, 0]); // looking at origin
            var up = new Float32Array([1 - smoothStep(camera_lerp * 3), 1, 0]); // world up
            var view = lookAt(position, target, up);
            var model = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]);
            gl.uniformMatrix4fv(uProjection, false, projection);
            gl.uniformMatrix4fv(uView, false, view);
            gl.uniformMatrix4fv(uModel, false, model);
            // controlPanelDebug(control_panel_items);
            gl.uniform1f(uTime, time);
            gl.uniform1f(uTWaveAlpha, (_d = (_c = control_panel_items.transmited_wave_alpha) === null || _c === void 0 ? void 0 : _c.valueAsNumber) !== null && _d !== void 0 ? _d : 0.5);
            gl.uniform1f(uAmplitudeScaling, (_f = (_e = control_panel_items.amplitude_scaling) === null || _e === void 0 ? void 0 : _e.valueAsNumber) !== null && _f !== void 0 ? _f : 1.0);
            gl.uniform1f(uTimeZoom, (_h = (_g = control_panel_items.time_zoom) === null || _g === void 0 ? void 0 : _g.valueAsNumber) !== null && _h !== void 0 ? _h : 800000.);
            gl.uniform1f(uSpaceZoom, (_k = (_j = control_panel_items.space_zoom) === null || _j === void 0 ? void 0 : _j.valueAsNumber) !== null && _k !== void 0 ? _k : 100.0);
            gl.uniform1f(uOmega, (_m = (_l = control_panel_items.omega) === null || _l === void 0 ? void 0 : _l.valueAsNumber) !== null && _m !== void 0 ? _m : 5000.0);
            gl.uniform1f(uBeta, (_p = (_o = control_panel_items.beta) === null || _o === void 0 ? void 0 : _o.valueAsNumber) !== null && _p !== void 0 ? _p : 5000.0);
            gl.uniform1f(uTheta, (_r = (_q = control_panel_items.theta) === null || _q === void 0 ? void 0 : _q.valueAsNumber) !== null && _r !== void 0 ? _r : 1.5);
            gl.uniform1f(uEta1, (_t = (_s = control_panel_items.eta1) === null || _s === void 0 ? void 0 : _s.valueAsNumber) !== null && _t !== void 0 ? _t : 376.9);
            gl.uniform1f(uEta2, (_v = (_u = control_panel_items.eta2) === null || _u === void 0 ? void 0 : _u.valueAsNumber) !== null && _v !== void 0 ? _v : 188.5);
        }
    }
    function draw() {
        if (gl != null) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            //draw
            gl.bindVertexArray(vao_1);
            // gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_INT, 0);
            gl.drawElements(gl.TRIANGLES, indices_1.length, gl.UNSIGNED_INT, 0);
        }
    }
    function animation() {
        var time = performance.now();
        update(time);
        draw();
        requestAnimationFrame(animation);
    }
    animation();
}
