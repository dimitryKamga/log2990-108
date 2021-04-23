import { Vec2 } from '@app/classes/vec2';
import { MainAttributes } from './tools-attributes';

export interface ControlPoints {
    topLeft: Vec2;
    top: Vec2;
    topRight: Vec2;
    right: Vec2;
    bottomRight: Vec2;
    bottom: Vec2;
    bottomLeft: Vec2;
    left: Vec2;
}

export interface SelectionBox extends MainAttributes {
    image: ImageData;
    width: number;
    height: number;
    topLeft: Vec2;
    initialPoint: Vec2;
    imageCanvas: HTMLCanvasElement;
    imageContexte: CanvasRenderingContext2D;
}

// Ceci est justifié pour faire la difference dans le undo-redo avec le nom des services SelectRectangle et SelectEllipse
// tslint:disable: no-empty-interface | raison:  Pour des interfaces a instructions vides
export interface SelectionEllipse extends MainAttributes {}
export interface SelectionRectangle extends MainAttributes {}
