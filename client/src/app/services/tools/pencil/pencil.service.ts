import { Injectable } from '@angular/core';
import { DOT_RADIUS_DIVIDER } from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { MouseButton } from '@app/classes/enums/draw-enums';
import { PencilAttributes } from '@app/classes/interfaces/tools-attributes';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.PENCIL;

    pencilAttributes: PencilAttributes;

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
        this.pencilAttributes.pathData = [];
    }

    initializeAttributes(): void {
        this.pencilAttributes = {
            name: TOOL_LABELS.PENCIL,
            pathData: [],
            mainColor: this.colorService.primaryColor,
            thickness: 1,
            secondaryColor: this.colorService.secondaryColor,
        };
    }

    setColors(): void {
        this.pencilAttributes.mainColor = this.colorService.primaryColor;
    }
    setThickness(thickness: number): void {
        this.pencilAttributes.thickness = thickness;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';
        this.shortcutsHandlerService.isShortcutKeyEnabled = false;

        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pencilAttributes.pathData.push(this.mouseDownCoord);
            this.undoRedoPiles.setSelectedTool(true);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pencilAttributes.pathData.push(mousePosition);
        }
        for (const point of this.pencilAttributes.pathData) {
            point.x -= 1;
            point.y -= 1;
        }
        this.mouseDown = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPencil(this.drawingService.baseCtx, this.pencilAttributes);
        this.undoRedoPiles.handlePiles(this.pencilAttributes);
        this.clearPath();
        this.undoRedoPiles.setSelectedTool(false);
        this.drawingService.autoSave();
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    onMouseMove(event: MouseEvent): void {
        this.onMouseEnter(event);
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pencilAttributes.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPencil(this.drawingService.previewCtx, this.pencilAttributes);
        }
    }

    onMouseLeave(): void {
        for (const point of this.pencilAttributes.pathData) {
            point.x -= 1;
            point.y -= 1;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawPencil(this.drawingService.baseCtx, this.pencilAttributes);
        if (this.mouseDown) {
            this.undoRedoPiles.handlePiles(this.pencilAttributes);
            this.drawingService.autoSave();
            this.clearPath();
            this.undoRedoPiles.setSelectedTool(false);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        if (event.buttons === 0) {
            this.mouseDown = false;
        }
    }

    drawPencil(ctx: CanvasRenderingContext2D, pencil: PencilAttributes): void {
        this.setColors();
        ctx.setLineDash([]);
        const dotRadius = pencil.thickness / DOT_RADIUS_DIVIDER;
        ctx.beginPath();
        ctx.lineWidth = pencil.thickness;
        ctx.strokeStyle = pencil.mainColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (pencil.pathData.length === 1) {
            ctx.arc(pencil.pathData[0].x, pencil.pathData[0].y, dotRadius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        for (const point of pencil.pathData) {
            if (point === pencil.pathData[0]) {
                ctx.moveTo(pencil.pathData[0].x - 1, pencil.pathData[0].y);
            }
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}
