interface ControlPanel {
    camera_pos: HTMLInputElement | null,

    transmited_wave_alpha: HTMLInputElement | null,
    amplitude_scaling: HTMLInputElement | null,
    time_zoom: HTMLInputElement | null,
    space_zoom: HTMLInputElement | null,

    time: HTMLInputElement | null,

    omega: HTMLInputElement | null,
    beta: HTMLInputElement | null,
    theta: HTMLInputElement | null,
    eta1: HTMLInputElement | null,
    eta2: HTMLInputElement | null,
}

function controlPanelDebug(control_panel: ControlPanel) {
    console.log(control_panel.camera_pos?.valueAsNumber);

    console.log(control_panel.transmited_wave_alpha?.valueAsNumber);
    console.log(control_panel.time_zoom?.valueAsNumber);
    console.log(control_panel.space_zoom?.valueAsNumber);

    console.log(control_panel.time?.valueAsNumber);

    console.log(control_panel.omega?.valueAsNumber);
    console.log(control_panel.beta?.valueAsNumber);
    console.log(control_panel.theta?.valueAsNumber);
    console.log(control_panel.eta1?.valueAsNumber);
    console.log(control_panel.eta2?.valueAsNumber);
}

const control_panel_items: ControlPanel = {
    camera_pos: document.getElementById("camera_pos") as HTMLInputElement,

    transmited_wave_alpha: document.getElementById("transmited_wave_alpha") as HTMLInputElement,
    amplitude_scaling: document.getElementById("amplitude_scaling") as HTMLInputElement,
    time_zoom: document.getElementById("time_zoom") as HTMLInputElement,
    space_zoom: document.getElementById("space_zoom") as HTMLInputElement,

    time: document.getElementById("time") as HTMLInputElement,

    omega: document.getElementById("omega") as HTMLInputElement,
    beta: document.getElementById("beta") as HTMLInputElement,
    theta: document.getElementById("theta") as HTMLInputElement,
    eta1: document.getElementById("eta1") as HTMLInputElement,
    eta2: document.getElementById("eta2") as HTMLInputElement,
};

// if (control_panel_items.slider_camera_pos != null) {
//     control_panel_items.slider_camera_pos.addEventListener("input", () => {
//         console.log(control_panel_items.slider_camera_pos.value);
//     });
// }
