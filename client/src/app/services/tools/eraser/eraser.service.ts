import { Injectable } from '@angular/core';
import { DEFAULT_THICKNESS_ERASER } from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { MouseButton } from '@app/classes/enums/draw-enums';
import { EraserAttributes } from '@app/classes/interfaces/tools-attributes';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.ERASER;

    eraserAttributes: EraserAttributes;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        private undoRedoPiles: UndoRedoPilesService,
        private shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        super(drawingService, colorService);
        this.initializeAttributes();
    }

    private clearPath(): void {
        this.eraserAttributes.pathData = [];
    }

    private drawEraserSquare(ctx: CanvasRenderingContext2D, eraserAttributes: EraserAttributes): void {
        for (const point of eraserAttributes.pathData) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.beginPath();
            const lineWidth = 1;
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'white';
            ctx.fillRect(
                point.x - eraserAttributes.thickness / 2,
                point.y - eraserAttributes.thickness / 2,
                eraserAttributes.thickness,
                eraserAttributes.thickness,
            );
            ctx.rect(
                point.x - eraserAttributes.thickness / 2,
                point.y - eraserAttributes.thickness / 2,
                eraserAttributes.thickness,
                eraserAttributes.thickness,
            );
            ctx.stroke();
        }
    }

    initializeAttributes(): void {
        this.eraserAttributes = {
            name: TOOL_LABELS.ERASER,
            pathData: [],
            mainColor: 'white',
            thickness: DEFAULT_THICKNESS_ERASER,
            secondaryColor: this.colorService.secondaryColor,
        };
    }

    eraseLine(ctx: CanvasRenderingContext2D, eraserAttributes: EraserAttributes): void {
        ctx.beginPath();
        ctx.strokeStyle = eraserAttributes.mainColor;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        if (eraserAttributes.pathData.length === 1) {
            ctx.clearRect(
                eraserAttributes.pathData[0].x - eraserAttributes.thickness / 2,
                eraserAttributes.pathData[0].y - eraserAttributes.thickness / 2,
                eraserAttributes.thickness,
                eraserAttributes.thickness,
            );
        }

        ctx.lineWidth = eraserAttributes.thickness;
        for (const point of eraserAttributes.pathData) {
            if (point === eraserAttributes.pathData[0]) {
                ctx.moveTo(eraserAttributes.pathData[0].x - 1, eraserAttributes.pathData[0].y);
            }
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    setThickness(thickness: number): void {
        this.eraserAttributes.thickness = thickness;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.LEFT;
        this.clearPath();
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.eraserAttributes.pathData.push(this.mouseDownCoord);
        this.drawEraserSquare(this.drawingService.previewCtx, this.eraserAttributes);
        if (this.mouseDown) {
            this.shortcutsHandlerService.isShortcutKeyEnabled = false;
            this.undoRedoPiles.setSelectedTool(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.eraserAttributes.pathData.push(mousePosition);
        this.drawEraserSquare(this.drawingService.previewCtx, this.eraserAttributes);

        this.undoRedoPiles.handlePiles(this.eraserAttributes);

        if (this.mouseDown) {
            this.eraseLine(this.drawingService.baseCtx, this.eraserAttributes);
            this.drawingService.autoSave();
            this.mouseDown = false;
            this.clearPath();
        }
        this.undoRedoPiles.setSelectedTool(false);
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.eraserAttributes.pathData.push(mousePosition);
        this.drawEraserSquare(this.drawingService.previewCtx, this.eraserAttributes);
        this.onMouseEnter(event);
        if (this.mouseDown) {
            this.eraseLine(this.drawingService.baseCtx, this.eraserAttributes);
        }
    }

    onMouseLeave(): void {
        if (this.mouseDown) {
            this.undoRedoPiles.handlePiles(this.eraserAttributes);
            this.clearPath();
            this.undoRedoPiles.setSelectedTool(false);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.eraserAttributes.pathData.push(mousePosition);
        this.drawEraserSquare(this.drawingService.previewCtx, this.eraserAttributes);
        if (event.buttons === 0) {
            this.mouseDown = false;
        }
    }
}
