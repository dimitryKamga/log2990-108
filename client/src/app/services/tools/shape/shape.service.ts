import { Injectable } from '@angular/core';
import { MouseButton, ShapeStyle } from '@app/classes/enums/draw-enums';
import { ShapeAttributes } from '@app/classes/interfaces/shapes-attributes';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty | raison: Pour des fonctions a instructions vides

@Injectable({
    providedIn: 'root',
})
export class ShapeService extends Tool {
    shapeAttributes: ShapeAttributes;
    isShiftDown: boolean;
    isDrawing: boolean;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        protected undoRedoPiles: UndoRedoPilesService,
        protected shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        super(drawingService, colorService);
        this.initializeAttributes();
    }

    protected drawShape(ctx: CanvasRenderingContext2D, shape: ShapeAttributes): void {}

    protected setShapeStyleAndThickness(shape: ShapeAttributes): void {}

    protected setContextStyle(ctx: CanvasRenderingContext2D, shapeAttributes: ShapeAttributes): void {
        this.setColors();
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.fillStyle = shapeAttributes.mainColor;
        ctx.strokeStyle = shapeAttributes.style === ShapeStyle.FILL ? shapeAttributes.mainColor : shapeAttributes.secondaryColor;
        ctx.lineWidth = shapeAttributes.thickness;
    }

    protected setBoundingBoxStyle(ctx: CanvasRenderingContext2D): void {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.setLineDash([2]);
    }

    protected setShapeNumberOfSide(shape: ShapeAttributes): void {}

    protected checkShapeIsInCanvas(shape: ShapeAttributes, factor: number): void {
        if (shape.finalPoint.x < factor) {
            shape.finalPoint.x = factor;
        }
        if (shape.finalPoint.y < factor) {
            shape.finalPoint.y = factor;
        }
        if (shape.finalPoint.x > this.drawingService.canvas.width - factor) {
            shape.finalPoint.x = this.drawingService.canvas.width - factor;
        }
        if (shape.finalPoint.y > this.drawingService.canvas.height - factor) {
            shape.finalPoint.y = this.drawingService.canvas.height - factor;
        }
    }

    initializeAttributes(): void {
        this.isShiftDown = false;
        this.isDrawing = false;
        this.shapeAttributes = {
            name: this.name,
            initialPoint: { x: 0, y: 0 },
            finalPoint: { x: 0, y: 0 },
            mainColor: this.colorService.primaryColor,
            secondaryColor: this.colorService.secondaryColor,
            numberOfSides: 3,
            thickness: 1,
            style: ShapeStyle.BORDER,
        };
    }

    setColors(): void {
        this.shapeAttributes.mainColor = this.colorService.primaryColor;
        this.shapeAttributes.secondaryColor = this.colorService.secondaryColor;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';

        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.shortcutsHandlerService.isShortcutKeyEnabled = false;
            this.shapeAttributes.initialPoint = this.getPositionFromMouse(event);
            this.setShapeStyleAndThickness(this.shapeAttributes);
            this.setShapeNumberOfSide(this.shapeAttributes);
            this.undoRedoPiles.setSelectedTool(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.isDrawing = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.shapeAttributes.finalPoint = this.getPositionFromMouse(event);
            this.draw(this.drawingService.baseCtx, this.shapeAttributes);
            this.undoRedoPiles.handlePiles(this.shapeAttributes);
            this.undoRedoPiles.setSelectedTool(false);
            this.drawingService.autoSave();
            this.mouseDown = false;
            this.isShiftDown = false;
        }
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.isDrawing = true;
            this.shapeAttributes.finalPoint = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.previewCtx, this.shapeAttributes);
        }
    }

    onMouseLeave(): void {
        if (this.mouseDown) {
            this.isDrawing = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.baseCtx, this.shapeAttributes);
            this.undoRedoPiles.handlePiles(this.shapeAttributes);
            this.mouseDown = false;
            this.isShiftDown = false;
            this.undoRedoPiles.setSelectedTool(false);
            this.drawingService.autoSave();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.mouseDown && event.shiftKey) {
            this.isShiftDown = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.previewCtx, this.shapeAttributes);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.mouseDown && !event.shiftKey) {
            this.isShiftDown = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.draw(this.drawingService.previewCtx, this.shapeAttributes);
        }
    }

    draw(ctx: CanvasRenderingContext2D, shape: ShapeAttributes): void {
        this.setContextStyle(ctx, shape);
        this.checkShapeIsInCanvas(shape, shape.thickness / 2);
        ctx.beginPath();
        this.drawShape(ctx, shape);
        if (shape.style !== ShapeStyle.BORDER) {
            ctx.fill();
        }
        if (shape.style !== ShapeStyle.FILL) {
            ctx.stroke();
        }
        ctx.closePath();
    }
}
