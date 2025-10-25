import { Shader } from "./shader.js";
import { Mesh } from "./mesh.js";
import { Vertices } from "./vertex.js";
import * as Types from "./types.js";
import * as Utils from "./utils.js"
import { canvas, gl } from "./canvas.js";
import { control_panel_items } from "./ui_elements.js";


const shader_plane: Shader = new Shader("./shaders/vertex_wave.glsl", "./shaders/fragment_wave.glsl");
const shader_ui: Shader = new Shader("./shaders/vertex_ui.glsl", "./shaders/fragment_ui.glsl");

if (gl != null) {
    const positions: Types.Position[] = [];
    const normals: Types.Normal[] = [];
    const uvs: Types.TexCoord[] = [];
    const colors: Types.Color[] = [];
    const indices_wave: number[] = [];

    // Create grid
    let grid_size = 200;
    let divider = (grid_size - 1);
    for (let v = 0; v < grid_size; v++) {
        for (let u = 0; u < grid_size; u++) {
            //Position
            const position_x = (u - (grid_size - 1) / 2);
            const position_y = (v - (grid_size - 1) / 2);
            positions.push(Types.float3(position_x / divider, 0.0, position_y / divider));

            //uv 
            const coord_u = u / divider;
            const coord_v = v / divider;
            uvs.push(Types.float2(coord_u, coord_v));
        }
    }

    for (let i = 0; i < grid_size * (grid_size - 1); i++) {
        if ((i + 1) % grid_size != 0) {
            const offset_up = i + grid_size;
            const offset_right = i + 1
            const offset_up_right = i + grid_size + 1;

            indices_wave.push(i, offset_up_right, offset_up, i, offset_right, offset_up_right);
        }
    }

    const vertices_wave: Vertices = { position: positions, normal: normals, uv: uvs, color: colors };
    const wave_mesh: Mesh = new Mesh(vertices_wave, new Uint32Array(indices_wave));

    // ui
    const vertices_ui: Vertices = {
        position: [
            Types.float3(-1.0, 0.0, -1.0),
            Types.float3(-1.0, 0.0, 1.0),
            Types.float3(1.0, 0.0, 1.0),
            Types.float3(1.0, 0.0, -1.0),
        ],
        normal: [],
        uv: [
            Types.float2(0.0, 0.0),
            Types.float2(1.0, 0.0),
            Types.float2(1.0, 1.0),
            Types.float2(0.0, 1.0),
        ],
        color: [
            Types.float4(1.0, 0.0, 0.0, 1.0),
            Types.float4(1.0, 1.0, 0.0, 1.0),
            Types.float4(1.0, 0.0, 1.0, 1.0),
            Types.float4(1.0, 0.0, 0.0, 1.0),
        ]
    };
    const indices_ui: Uint32Array = new Uint32Array([0, 1, 2, 0, 2, 3]);
    const ui_mesh: Mesh = new Mesh(vertices_ui, new Uint32Array(indices_ui));

    //----------------------------------------------------------------------

    gl.clearColor(.1, .1, .1, 1); //gray
    // gl.clearColor(1, 0, 1, 1); //magneta
    function update(time: number) {
        if (gl != null) {

            let screen_divider = 0.8;
            let width_aspect = canvas.width / Math.max(canvas.width, canvas.height) / screen_divider;
            let height_aspect = canvas.height / Math.max(canvas.width, canvas.height) / screen_divider;

            const projection = Utils.ortho(width_aspect, height_aspect, 0.01, 100.0);

            // bezier position
            const p0 = Types.float3(0.0, 1.0, 0.0);
            const p1 = Types.float3(-0.75, 0.85, 0.25);
            const p2 = Types.float3(-0.85, 0.81, 0.5);
            const p3 = Types.float3(-1.0, 0.8, 0.75);

            const camera_lerp = control_panel_items.camera_pos?.valueAsNumber ?? 1.0;

            const position = Utils.bezier3(p0, p1, p2, p3, camera_lerp);   // camera position

            const target = Types.float3(0, 0, 0);     // looking at origin
            const up = Types.float3(1 - Utils.smoothStep(camera_lerp * 3), 1, 0); // World up

            const view = Utils.lookAt(position, target, up);
            const model = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]);

            shader_ui.setUniformMatrix4fv("uProjection", projection);
            shader_ui.setUniformMatrix4fv("uView", view);
            shader_ui.setUniformMatrix4fv("uModel", new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0.2, 0, 1,
            ]));

            shader_plane.setUniformMatrix4fv("uProjection", projection);
            shader_plane.setUniformMatrix4fv("uView", view);
            shader_plane.setUniformMatrix4fv("uModel", model);

            shader_plane.setUniform1f("uTime", time);
            shader_plane.setUniform1f("uTWaveAlpha", control_panel_items.transmited_wave_alpha?.valueAsNumber ?? 0.5);
            shader_plane.setUniform1f("uAmplitudeScaling", control_panel_items.amplitude_scaling?.valueAsNumber ?? 1.0);
            shader_plane.setUniform1f("uTimeZoom", control_panel_items.time_zoom?.valueAsNumber ?? 800000.0);
            shader_plane.setUniform1f("uSpaceZoom", control_panel_items.space_zoom?.valueAsNumber ?? 100.0);
            shader_plane.setUniform1f("uOmega", control_panel_items.omega?.valueAsNumber ?? 5000.0);
            shader_plane.setUniform1f("uBeta", control_panel_items.beta?.valueAsNumber ?? 5000.0);
            shader_plane.setUniform1f("uTheta", control_panel_items.theta?.valueAsNumber ?? 1.5);
            shader_plane.setUniform1f("uEta1", control_panel_items.eta1?.valueAsNumber ?? 376.9);
            shader_plane.setUniform1f("uEta2", control_panel_items.eta2?.valueAsNumber ?? 188.5);
        }
    }

    function draw() {
        if (gl != null) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            //draw
            ui_mesh.draw(shader_ui);
            wave_mesh.draw(shader_plane);
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
