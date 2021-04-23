import { Angles, Quad } from '@app/classes/enums/draw-enums';
import { Vec2 } from '@app/classes/vec2';

export interface LineVariables {
    angle: number;
    gradient: Angles;
    mousePosition: Vec2;
    contiguous: number;
    opposite: number;
    mouseClicks: Vec2[];
    quad: Quad;
    hypothenuse: number;
    radians: number;
}

export interface LineDraw {
    ctx: CanvasRenderingContext2D;
    thickness: number;
}
