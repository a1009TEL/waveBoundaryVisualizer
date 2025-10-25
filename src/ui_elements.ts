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

export const control_panel_items: ControlPanel = {
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
