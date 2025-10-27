import { gl } from "./canvas.js";

export function initTexture(image: HTMLImageElement) {
    if (gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Upload the image into the texture
        gl.texImage2D(
            gl.TEXTURE_2D,  // target
            0,              // mip level
            gl.RGBA,        // internal format
            gl.RGBA,        // source format
            gl.UNSIGNED_BYTE, // source type
            image           // the actual image
        );

        const err = gl.getError();
        if (err !== gl.NO_ERROR) {
            console.error("Texture upload failed:", err);
            return;
        }

        // Texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // Unbind for safety
        gl.bindTexture(gl.TEXTURE_2D, null);

        return texture;
    }
}
