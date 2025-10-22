function controlPanelDebug(control_panel) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    console.log((_a = control_panel.camera_pos) === null || _a === void 0 ? void 0 : _a.valueAsNumber);
    console.log((_b = control_panel.transmited_wave_alpha) === null || _b === void 0 ? void 0 : _b.valueAsNumber);
    console.log((_c = control_panel.time_zoom) === null || _c === void 0 ? void 0 : _c.valueAsNumber);
    console.log((_d = control_panel.space_zoom) === null || _d === void 0 ? void 0 : _d.valueAsNumber);
    console.log((_e = control_panel.time) === null || _e === void 0 ? void 0 : _e.valueAsNumber);
    console.log((_f = control_panel.omega) === null || _f === void 0 ? void 0 : _f.valueAsNumber);
    console.log((_g = control_panel.beta) === null || _g === void 0 ? void 0 : _g.valueAsNumber);
    console.log((_h = control_panel.theta) === null || _h === void 0 ? void 0 : _h.valueAsNumber);
    console.log((_j = control_panel.eta1) === null || _j === void 0 ? void 0 : _j.valueAsNumber);
    console.log((_k = control_panel.eta2) === null || _k === void 0 ? void 0 : _k.valueAsNumber);
}
var control_panel_items = {
    camera_pos: document.getElementById("camera_pos"),
    transmited_wave_alpha: document.getElementById("transmited_wave_alpha"),
    amplitude_scaling: document.getElementById("amplitude_scaling"),
    time_zoom: document.getElementById("time_zoom"),
    space_zoom: document.getElementById("space_zoom"),
    time: document.getElementById("time"),
    omega: document.getElementById("omega"),
    beta: document.getElementById("beta"),
    theta: document.getElementById("theta"),
    eta1: document.getElementById("eta1"),
    eta2: document.getElementById("eta2"),
};
// if (control_panel_items.slider_camera_pos != null) {
//     control_panel_items.slider_camera_pos.addEventListener("input", () => {
//         console.log(control_panel_items.slider_camera_pos.value);
//     });
// }
