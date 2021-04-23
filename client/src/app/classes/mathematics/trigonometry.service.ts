import { Injectable } from '@angular/core';
import { Angles, LimitAngle, Quad } from '@app/classes/enums/draw-enums';

@Injectable({
    providedIn: 'root',
})
export class TrigonometryService {
    calculateCursorQuad(contiguous: number, opposite: number): Quad {
        if (contiguous >= 0 && opposite >= 0) {
            return Quad.TOP_RIGHT;
        } else if (contiguous <= 0 && opposite >= 0) {
            return Quad.TOP_LEFT;
        } else if (contiguous <= 0 && opposite <= 0) {
            return Quad.BOTTOM_LEFT;
        } else {
            return Quad.BOTTOM_RIGHT;
        }
    }

    calculateQuadTopRight(angle: number): Angles {
        if (LimitAngle._0 <= angle && angle <= LimitAngle._22_5) {
            return Angles._0;
        } else if (LimitAngle._22_5 < angle && angle <= LimitAngle._67_5) {
            return Angles._45;
        } else {
            return Angles._90;
        }
    }

    calculateQuadTopLeft(angle: number): Angles {
        if (LimitAngle._90 > angle && angle >= LimitAngle._67_5) {
            return Angles._90;
        } else if (LimitAngle._67_5 > angle && angle >= LimitAngle._22_5) {
            return Angles._135;
        } else {
            return Angles._180;
        }
    }

    calculateQuadBottomLeft(angle: number): Angles {
        if (LimitAngle._0 <= angle && angle <= LimitAngle._22_5) {
            return Angles._180;
        } else if (LimitAngle._22_5 < angle && angle <= LimitAngle._67_5) {
            return Angles._225;
        } else {
            return Angles._270;
        }
    }

    calculateQuadBottomRight(angle: number): Angles {
        if (LimitAngle._90 > angle && angle >= LimitAngle._67_5) {
            return Angles._270;
        } else if (LimitAngle._67_5 > angle && angle >= LimitAngle._22_5) {
            return Angles._315;
        } else {
            return Angles._0;
        }
    }

    calculatePolygonAngle(numberOfSides: number): number {
        return ((numberOfSides - 2) * Math.PI) / numberOfSides;
    }

    calculatePolygonCornerWidth(numberOfSides: number, thickness: number): number {
        const angle = this.calculatePolygonAngle(numberOfSides) / 2;
        return thickness / Math.sin(angle);
    }
}
