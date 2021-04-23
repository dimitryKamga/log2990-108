import { Injectable } from '@angular/core';
import { ANGLE_180, MAX_DISTANCE_LINE_PIXELS } from '@app/classes/constants/draw-constants';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class GeneralFunctionsService {
    convertInDegrees(radians: number): number {
        return radians * (ANGLE_180 / Math.PI);
    }

    getDistanceBetweenTwoPoints(pointOne: Vec2, pointTwo: Vec2): number {
        const a = pointTwo.x - pointOne.x;
        const b = pointTwo.y - pointOne.y;
        return Math.sqrt(a * a + b * b);
    }
    getMiddleBetweenTwoPoints(pointOne: Vec2, pointTwo: Vec2): Vec2 {
        let centerX = Math.floor(pointTwo.x - pointOne.x) / 2;
        let centerY = Math.floor(pointTwo.y - pointOne.y) / 2;

        centerX = pointOne.x > pointTwo.x ? pointTwo.x + centerX : pointTwo.x - centerX;
        centerY = pointOne.y > pointTwo.y ? pointTwo.y + centerY : pointTwo.y - centerY;
        return { x: centerX, y: centerY };
    }

    checkSegmentDistance(pointOne: Vec2, secondPoint: Vec2): boolean {
        const a = secondPoint.x - pointOne.x;
        const b = secondPoint.y - pointOne.y;
        const c = Math.sqrt(a * a + b * b);
        return c <= MAX_DISTANCE_LINE_PIXELS;
    }

    checkOutsideEllipseSurface(point: Vec2, radius: Vec2): boolean {
        return Math.pow(point.x, 2) / Math.pow(radius.x, 2) + Math.pow(point.y, 2) / Math.pow(radius.y, 2) > 1;
    }

    getShorterSide(width: number, height: number): number {
        return Math.min(Math.abs(height), Math.abs(width));
    }

    getDirection(width: number): number {
        return width / Math.abs(width);
    }
}
