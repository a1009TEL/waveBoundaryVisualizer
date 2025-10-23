const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2", { alpha: true });

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
const vsSource = `#version 300 es
    layout (location = 0) in vec3 aPosition;
    layout (location = 1) in vec2 aUV;
    layout (location = 2) in vec4 aColor;
    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;

    uniform float uTime;

    uniform float uTWaveAlpha;
    uniform float uAmplitudeScaling;
    uniform float uTimeZoom;
    uniform float uSpaceZoom;

    uniform float uOmega;
    uniform float uBeta;
    uniform float uTheta;
    uniform float uEta1;
    uniform float uEta2;

    out vec4 vColor;

    void main() {
        float time_scaling = uOmega / uTimeZoom;
        float space_scaling = uBeta / uSpaceZoom;

        float eta1 = uEta1;
        float eta2 = uEta2;
        float incident_angle = uTheta;

        float transmited_angle = asin(sin(incident_angle) * eta2/eta1);

        float incident_axis = dot(vec3(sin(incident_angle), 0.0, cos(incident_angle)), aPosition);
        float reflected_axis = dot(vec3(sin(incident_angle), 0.0, -cos(incident_angle)), aPosition);
        float transmited_axis = dot(vec3(sin(transmited_angle), 0.0, cos(transmited_angle)), aPosition) / (eta2 / eta1);

        float incident_amplitude = 2.0/space_scaling;
        float reflected_amplitude = (eta2*cos(incident_angle)-eta1*cos(transmited_angle))/(eta2*cos(incident_angle)+eta1*cos(transmited_angle)) * incident_amplitude;
        float transmited_amplitude = (2.0*eta2*cos(incident_angle))/(eta2*cos(incident_angle)+eta1*cos(transmited_angle)) * incident_amplitude;

        float incident = sin(incident_axis*space_scaling-uTime*time_scaling)*incident_amplitude;
        float reflected = sin(reflected_axis*space_scaling-uTime*time_scaling)*reflected_amplitude;
        float transmited = sin(transmited_axis*space_scaling-uTime*time_scaling)*transmited_amplitude;

        float pos_y = mix(incident + reflected, transmited, aPosition.z > 0.0);

        vec3 red_white = mix(vec3(1.0,1.0,1.0), vec3(1.0,0.0,0.0), pos_y/incident_amplitude);
        vec3 white_blue = mix(vec3(1.0,1.0,1.0), vec3(0.0,0.0,1.0), -pos_y/incident_amplitude);
        vec3 color_map = mix(red_white, white_blue, step(pos_y, 0.0));
        vec4 color_map_alpha = mix(vec4(color_map, uTWaveAlpha), vec4(color_map, 1.0), step(aPosition.z, 0.0));


        vColor = color_map_alpha;
        gl_Position = uProjection * uView * uModel * vec4(aPosition.x, pos_y * uAmplitudeScaling, aPosition.z, 1.0);
        // vColor = vec4(aPosition,1.0);
        // vColor = vec4(aUV, 0,0.0);
    }
    `;

const fsSource = `#version 300 es
    precision mediump float;

    in vec4 vColor;
    out vec4 outColor;

    void main() {
        outColor = vColor;
        // outColor = vec4(gl_FragCoord.w, 0.0,0.0,0.0);
        // outColor = vec4(1.0,1.0,1.0,0.1);
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
    let grid_size = 200;
    let divider = (grid_size - 1);
    for (let v = 0; v < grid_size; v++) {
        for (let u = 0; u < grid_size; u++) {
            //Position
            const position_x = (u - (grid_size - 1) / 2);
            const position_y = (v - (grid_size - 1) / 2);
            positions.push(position_x / divider, 0.0, position_y / divider);

            //uv 
            const coord_u = u / divider;
            const coord_v = v / divider;
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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

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

    //----------------------------------------------------------------------

    gl.clearColor(.1, .1, .1, 1); //gray
    // gl.clearColor(1, 0, 1, 1); //magneta
    function update(time: number) {
        if (gl != null) {
            const uProjection = gl.getUniformLocation(program, "uProjection");
            const uView = gl.getUniformLocation(program, "uView");
            const uModel = gl.getUniformLocation(program, "uModel");
            const uTime = gl.getUniformLocation(program, "uTime");
            const uTWaveAlpha = gl.getUniformLocation(program, "uTWaveAlpha");
            const uAmplitudeScaling = gl.getUniformLocation(program, "uAmplitudeScaling");
            const uTimeZoom = gl.getUniformLocation(program, "uTimeZoom");
            const uSpaceZoom = gl.getUniformLocation(program, "uSpaceZoom");
            const uOmega = gl.getUniformLocation(program, "uOmega");
            const uBeta = gl.getUniformLocation(program, "uBeta");
            const uTheta = gl.getUniformLocation(program, "uTheta");
            const uEta1 = gl.getUniformLocation(program, "uEta1")
            const uEta2 = gl.getUniformLocation(program, "uEta2");

            let screen_divider = 0.8;
            let width_aspect = canvas.width / Math.max(canvas.width, canvas.height) / screen_divider;
            let height_aspect = canvas.height / Math.max(canvas.width, canvas.height) / screen_divider;
            let r = width_aspect / 2;
            let l = -width_aspect / 2;
            let t = height_aspect / 2;
            let b = -height_aspect / 2;
            let near_clip = 0.01;
            let far_clip = 100.0;

            const projection = new Float32Array([
                2 / (r - l), 0, 0, -(r + l) / (r - l),
                0, 2 / (t - b), 0, -(t + b) / (t - b),
                0, 0, -2 / (far_clip - near_clip), - (far_clip + near_clip) / (far_clip - near_clip),
                0, 0, 0, 1,
            ]);

            // bezier position
            const p0 = [0.0, 1.0, 0.0];
            const p1 = [-0.75, 0.85, 0.25];
            const p2 = [-0.85, 0.81, 0.5];
            const p3 = [-1.0, 0.8, 0.75];

            const camera_lerp = control_panel_items.camera_pos?.valueAsNumber ?? 1.0;

            const position = bezier3(p0, p1, p2, p3, camera_lerp);   // camera position

            const target = new Float32Array([0, 0, 0]);     // looking at origin
            const up = new Float32Array([1 - smoothStep(camera_lerp * 3), 1, 0]);         // world up

            const view = lookAt(position, target, up);
            const model = new Float32Array([
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
            gl.uniform1f(uTWaveAlpha, control_panel_items.transmited_wave_alpha?.valueAsNumber ?? 0.5);
            gl.uniform1f(uAmplitudeScaling, control_panel_items.amplitude_scaling?.valueAsNumber ?? 1.0);
            gl.uniform1f(uTimeZoom, control_panel_items.time_zoom?.valueAsNumber ?? 800000.);
            gl.uniform1f(uSpaceZoom, control_panel_items.space_zoom?.valueAsNumber ?? 100.0);
            gl.uniform1f(uOmega, control_panel_items.omega?.valueAsNumber ?? 5000.0);
            gl.uniform1f(uBeta, control_panel_items.beta?.valueAsNumber ?? 5000.0);
            gl.uniform1f(uTheta, control_panel_items.theta?.valueAsNumber ?? 1.5);
            gl.uniform1f(uEta1, control_panel_items.eta1?.valueAsNumber ?? 376.9);
            gl.uniform1f(uEta2, control_panel_items.eta2?.valueAsNumber ?? 188.5);
        }
    }

    function draw() {
        if (gl != null) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            //draw
            gl.bindVertexArray(vao);
            // gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_INT, 0);
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
        }
    }

    function animation() {
        const time = performance.now();
        update(time);
        draw();
        requestAnimationFrame(animation);
    }

    animation();
}
