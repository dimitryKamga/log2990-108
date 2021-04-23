import { Injectable } from '@angular/core';
import { Angles, Quad } from '@app/classes/enums/draw-enums';
import { LineVariables } from '@app/classes/interfaces/line-interfaces';
import { LineAttributes } from '@app/classes/interfaces/tools-attributes';
import { Vec2 } from '@app/classes/vec2';
import { GeneralFunctionsService } from './general-functions.service';
import { TrigonometryService } from './trigonometry.service';

@Injectable({
    providedIn: 'root',
})
export class LineFunctionsService {
    constructor(private trigonometry: TrigonometryService, private generalFunctions: GeneralFunctionsService) {}

    calculateClosestAngle(lineVariables: LineVariables): Angles {
        switch (lineVariables.quad) {
            case Quad.TOP_RIGHT: {
                return this.trigonometry.calculateQuadTopRight(lineVariables.angle);
            }
            case Quad.TOP_LEFT: {
                return this.trigonometry.calculateQuadTopLeft(lineVariables.angle);
            }
            case Quad.BOTTOM_LEFT: {
                return this.trigonometry.calculateQuadBottomLeft(lineVariables.angle);
            }
            case Quad.BOTTOM_RIGHT: {
                return this.trigonometry.calculateQuadBottomRight(lineVariables.angle);
            }
        }
    }

    rotateAngle(lineVariables: LineVariables): Vec2 {
        switch (lineVariables.gradient) {
            case Angles._0: {
                return { x: lineVariables.mousePosition.x, y: lineVariables.mouseClicks[lineVariables.mouseClicks.length - 1].y };
            }
            case Angles._45: {
                return {
                    x: lineVariables.mousePosition.x,
                    y: lineVariables.mouseClicks[lineVariables.mouseClicks.length - 1].y - lineVariables.contiguous,
                };
            }
            case Angles._90: {
                return { x: lineVariables.mouseClicks[lineVariables.mouseClicks.length - 1].x, y: lineVariables.mousePosition.y };
            }
            case Angles._135: {
                return {
                    x: lineVariables.mousePosition.x,
                    y: lineVariables.mouseClicks[lineVariables.mouseClicks.length - 1].y - lineVariables.contiguous,
                };
            }
            case Angles._180: {
                return { x: lineVariables.mousePosition.x, y: lineVariables.mouseClicks[lineVariables.mouseClicks.length - 1].y };
            }
            case Angles._225: {
                return {
                    x: lineVariables.mousePosition.x,
                    y: lineVariables.mouseClicks[lineVariables.mouseClicks.length - 1].y + lineVariables.contiguous,
                };
            }
            case Angles._270: {
                return { x: lineVariables.mouseClicks[lineVariables.mouseClicks.length - 1].x, y: lineVariables.mousePosition.y };
            }
            case Angles._315: {
                return {
                    x: lineVariables.mousePosition.x,
                    y: lineVariables.mouseClicks[lineVariables.mouseClicks.length - 1].y + lineVariables.contiguous,
                };
            }
        }
    }

    private findHypothenuse(lineVariable: LineVariables): void {
        if (!lineVariable.hypothenuse) {
            lineVariable.hypothenuse = 1;
        }
    }

    calculateRotationAngle(mousePosition: Vec2, lineVariables: LineVariables, lineAttributes: LineAttributes): void {
        lineVariables.mousePosition = mousePosition;
        lineVariables.mouseClicks = lineAttributes.mouseClicks;
        lineVariables.contiguous = lineVariables.mousePosition.x - lineAttributes.mouseClicks[lineAttributes.mouseClicks.length - 1].x;
        lineVariables.opposite = lineAttributes.mouseClicks[lineAttributes.mouseClicks.length - 1].y - lineVariables.mousePosition.y;
        lineVariables.hypothenuse = Math.sqrt(Math.pow(lineVariables.opposite, 2) + Math.pow(lineVariables.contiguous, 2));
        lineVariables.quad = this.trigonometry.calculateCursorQuad(lineVariables.contiguous, lineVariables.opposite);
        lineVariables.contiguous = Math.abs(lineVariables.contiguous);
        lineVariables.opposite = Math.abs(lineVariables.opposite);
        this.findHypothenuse(lineVariables);
        lineVariables.radians = Math.asin(lineVariables.opposite / lineVariables.hypothenuse);
        lineVariables.angle = this.generalFunctions.convertInDegrees(lineVariables.radians);
        lineVariables.gradient = this.calculateClosestAngle(lineVariables);
    }

    isJunctionActive(ctx: CanvasRenderingContext2D, lineAttributes: LineAttributes): void {
        if (lineAttributes.isJunction) {
            const junction = lineAttributes.mouseClicks.length;
            let lastPosition: Vec2 | undefined;

            if (lineAttributes.isLastPoint) {
                lineAttributes.mouseClicks[lineAttributes.mouseClicks.length - 2] = lineAttributes.mouseClicks[lineAttributes.mouseClicks.length - 1];
                lastPosition = lineAttributes.mouseClicks.pop();
            }

            if (lineAttributes.isDoubleClicked) {
                lineAttributes.mouseClicks[lineAttributes.mouseClicks.length - 1] =
                    lineAttributes.savedSegment[lineAttributes.savedSegment.length - 1].lastPoint;
            }

            for (let i = 0; i < junction - 1; i++) {
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(lineAttributes.mouseClicks[i].x, lineAttributes.mouseClicks[i].y, lineAttributes.dotRadius / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }

            if (lineAttributes.isLastPoint) {
                lineAttributes.mouseClicks.push(lastPosition as Vec2);
            }
        }
    }
}
