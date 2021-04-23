import { Injectable } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { ShapeStyle } from '@app/classes/enums/draw-enums';
import { EllipseAttributes, ShapeAttributes } from '@app/classes/interfaces/shapes-attributes';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends ShapeService {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.ELLIPSE;

    ellipseAttributes: EllipseAttributes;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        undoRedoPiles: UndoRedoPilesService,
        private generalFunctions: GeneralFunctionsService,
        protected shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        super(drawingService, colorService, undoRedoPiles, shortcutsHandlerService);
        this.initializeAttributes();
        this.initializeEllipseAttributes();
    }

    private setCircleRadiusAndCenter(shape: ShapeAttributes, ellipse: EllipseAttributes): void {
        const shorterRadius = this.generalFunctions.getShorterSide(ellipse.radius.x, ellipse.radius.y);
        ellipse.circleRadius = {
            x: shorterRadius * this.generalFunctions.getDirection(ellipse.radius.x),
            y: shorterRadius * this.generalFunctions.getDirection(ellipse.radius.y),
        };
        ellipse.circleCenter = {
            x: shape.initialPoint.x + ellipse.circleRadius.x,
            y: shape.initialPoint.y + ellipse.circleRadius.y,
        };
    }

    private drawBoundingBox(ctx: CanvasRenderingContext2D, shape: ShapeAttributes, ellipse: EllipseAttributes): void {
        if (this.isDrawing) {
            super.setBoundingBoxStyle(ctx);
            const width = this.isShiftDown ? 2 * ellipse.circleRadius.x : 2 * ellipse.radius.x;
            const widthDirection = shape.style === ShapeStyle.FILL ? 0 : this.generalFunctions.getDirection(width);
            const height = this.isShiftDown ? 2 * ellipse.circleRadius.y : 2 * ellipse.radius.y;
            const heightDirection = shape.style === ShapeStyle.FILL ? 0 : this.generalFunctions.getDirection(height);
            ctx.rect(
                shape.initialPoint.x - (widthDirection * ellipse.thickness) / 2,
                shape.initialPoint.y - (heightDirection * ellipse.thickness) / 2,
                width + widthDirection * ellipse.thickness,
                height + heightDirection * ellipse.thickness,
            );
            ctx.stroke();
            ctx.setLineDash([]);
            this.setContextStyle(ctx, shape);
            ctx.beginPath();
        }
    }

    private setEllipseRadiusAndCenter(shape: ShapeAttributes, ellipse: EllipseAttributes): void {
        ellipse.radius = {
            x: (shape.finalPoint.x - shape.initialPoint.x) / 2,
            y: (shape.finalPoint.y - shape.initialPoint.y) / 2,
        };
        ellipse.center = { x: shape.initialPoint.x + ellipse.radius.x, y: shape.initialPoint.y + ellipse.radius.y };
    }

    protected setShapeStyleAndThickness(shape: ShapeAttributes): void {
        shape.style = this.ellipseAttributes.style;
        shape.thickness = this.ellipseAttributes.thickness;
    }

    protected drawShape(ctx: CanvasRenderingContext2D, shape: ShapeAttributes): void {
        this.setEllipseRadiusAndCenter(shape, this.ellipseAttributes);
        this.setCircleRadiusAndCenter(shape, this.ellipseAttributes);
        const ellipse = this.ellipseAttributes;
        const center = this.isShiftDown ? ellipse.circleCenter : ellipse.center;
        const radius = this.isShiftDown ? ellipse.circleRadius : ellipse.radius;
        this.drawBoundingBox(ctx, shape, ellipse);
        ctx.ellipse(center.x, center.y, Math.abs(radius.x), Math.abs(radius.y), 0, 0, Math.PI * 2, false);
    }

    initializeEllipseAttributes(): void {
        this.ellipseAttributes = {
            name: this.name,
            initialPoint: { x: 0, y: 0 },
            finalPoint: { x: 0, y: 0 },
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            circleCenter: { x: 0, y: 0 },
            circleRadius: { x: 0, y: 0 },
            mainColor: this.colorService.primaryColor,
            secondaryColor: this.colorService.secondaryColor,
            numberOfSides: 0,
            thickness: 1,
            isShiftDown: false,
            style: ShapeStyle.BORDER,
        };
    }

    setStyle(style: number): void {
        this.ellipseAttributes.style = style;
    }

    setThickness(thickness: number): void {
        this.ellipseAttributes.thickness = thickness;
    }
}
