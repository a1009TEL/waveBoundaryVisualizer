class ShaderProgram {
    constructor(vertex_source, fragment_source) {
        this.vertex_source = vertex_source;
        this.fragment_source = fragment_source;

        const vertexShader = createShader(gl.VERTEX_SHADER, this.vertex_source);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, this.fragment_source);

        this.program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
    }
}
