export { canvas, gl };
const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2", { alpha: true });
if (!gl) {
    alert("WebGL 2 not supported");
}
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
if (gl != null) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}
