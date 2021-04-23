import { MainAttributes } from '@app/classes/interfaces/tools-attributes';
import { Vec2 } from '@app/classes/vec2';

export interface ShapeAttributes extends MainAttributes {
    style: number;
    initialPoint: Vec2;
    finalPoint: Vec2;
    numberOfSides: number;
}

export interface RectangleAttributes extends ShapeAttributes {
    width: number;
    height: number;
    isShiftDown: boolean;
}

export interface EllipseAttributes extends ShapeAttributes {
    center: Vec2;
    radius: Vec2;
    circleCenter: Vec2;
    circleRadius: Vec2;
    isShiftDown: boolean;
}

export interface PolygonAttributes extends ShapeAttributes {
    center: Vec2;
    radius: number;
}
