import { Injectable } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { ShapeStyle } from '@app/classes/enums/draw-enums';
import { RectangleAttributes, ShapeAttributes } from '@app/classes/interfaces/shapes-attributes';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends ShapeService {
    rectangleAttributes: RectangleAttributes;
    name: string = TOOL_LABELS.RECTANGLE;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        undoRedoPiles: UndoRedoPilesService,
        private generalFunctions: GeneralFunctionsService,
        protected shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        super(drawingService, colorService, undoRedoPiles, shortcutsHandlerService);
        this.initializeAttributes();
        this.initializeRectangleAttributes();
    }

    private setRectangleWidthAndHeight(shape: ShapeAttributes, rectangle: RectangleAttributes): void {
        rectangle.width = shape.finalPoint.x - shape.initialPoint.x;
        rectangle.height = shape.finalPoint.y - shape.initialPoint.y;
    }

    protected setShapeStyleAndThickness(shape: ShapeAttributes): void {
        shape.style = this.rectangleAttributes.style;
        shape.thickness = this.rectangleAttributes.thickness;
    }

    protected drawShape(ctx: CanvasRenderingContext2D, shape: ShapeAttributes): void {
        this.setRectangleWidthAndHeight(shape, this.rectangleAttributes);
        const width = this.rectangleAttributes.width;
        const height = this.rectangleAttributes.height;
        if (this.isShiftDown) {
            const squareWidth = this.generalFunctions.getShorterSide(width, height) * this.generalFunctions.getDirection(width);
            const squareHeight = this.generalFunctions.getShorterSide(width, height) * this.generalFunctions.getDirection(height);
            ctx.rect(shape.initialPoint.x, shape.initialPoint.y, squareWidth, squareHeight);
        } else {
            ctx.rect(shape.initialPoint.x, shape.initialPoint.y, width, height);
        }
    }

    initializeRectangleAttributes(): void {
        this.rectangleAttributes = {
            name: this.name,
            initialPoint: { x: 0, y: 0 },
            finalPoint: { x: 0, y: 0 },
            width: 0,
            height: 0,
            mainColor: this.colorService.primaryColor,
            secondaryColor: this.colorService.secondaryColor,
            numberOfSides: 0,
            thickness: 1,
            isShiftDown: false,
            style: ShapeStyle.BORDER,
        };
    }

    setStyle(style: number): void {
        this.rectangleAttributes.style = style;
    }

    setThickness(thickness: number): void {
        this.rectangleAttributes.thickness = thickness;
    }
}
