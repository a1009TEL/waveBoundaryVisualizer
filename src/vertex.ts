import { Position, Normal, TexCoord, Color } from "./types.js";

export interface Vertices {
    position: Position[],
    normal: Normal[],
    uv: TexCoord[],
    color: Color[]
}
