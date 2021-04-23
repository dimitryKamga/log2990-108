import { StampChoiceLabels } from '@app/classes/enums/draw-enums';
import { Vec2 } from '@app/classes/vec2';
import { BehaviorSubject } from 'rxjs';
import { SelectionBox } from './select-interface';
// Ceci est justifié pour faire la difference dans le undo-redo avec le nom des services SelectRectangle et SelectEllipse
// tslint:disable: no-empty-interface | raison:  Pour des interfaces a instructions vides

export interface MainAttributes {
    name: string;
    mainColor: string;
    secondaryColor: string;
    thickness: number;
}
export interface Segment {
    firstPoint: Vec2;
    lastPoint: Vec2;
}

export interface LineAttributes extends MainAttributes {
    segment: Segment;
    mouseClicks: Vec2[];
    isJunction: boolean;
    endLine: string;
    isDoubleClicked: boolean;
    isLastPoint: boolean;
    savedSegment: Segment[];
    dotRadius: number;
}

export interface LassoAttributes extends LineAttributes {}

export interface LassoUndoAttributes extends LassoAttributes, SelectionBox {}

export interface PencilAttributes extends MainAttributes {
    pathData: Vec2[];
}

export interface EraserAttributes extends MainAttributes {
    pathData: Vec2[];
}

export interface SprayAttributes extends MainAttributes {
    pathData: Vec2;
    jetDiameter: number;
    dropletDiameter: number;
    frequency: number;
    imageData: ImageData;
}

export interface BucketAttributes extends MainAttributes {
    tolerance: BehaviorSubject<number>;
    imageData: ImageData;
}

export interface StampAttributes extends MainAttributes {
    pathData: Vec2;
    angle: BehaviorSubject<number>;
    stampChoice: StampChoiceLabels;
    size: number;
}

export interface ResizeAttributes extends MainAttributes {
    name: string;
    canvasSize: Vec2;
    imageData: ImageData;
}

export interface CarrouselAttributes extends MainAttributes {
    image: string;
}
export interface TextAttributes extends MainAttributes {
    imageData: ImageData;
}
