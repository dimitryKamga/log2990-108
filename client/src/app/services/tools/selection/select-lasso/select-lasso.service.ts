import { Injectable } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SelectionMode } from '@app/classes/enums/draw-enums';
import { ControlPoints, SelectionBox } from '@app/classes/interfaces/select-interface';
import { LassoAttributes, LassoUndoAttributes } from '@app/classes/interfaces/tools-attributes';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetService } from '@app/services/magnet/magnet.service';
import { LineService } from '@app/services/tools/line/line.service';
import { SelectionResizeService } from '@app/services/tools/selection/selection-resize/selection-resize.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class SelectLassoService extends SelectionResizeService {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.LASSO;

    imageBorderTable: Vec2[];
    return: boolean;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        undoRedoPiles: UndoRedoPilesService,
        gridService: GridService,
        magnetService: MagnetService,
        private lineService: LineService,
        protected generalFunctions: GeneralFunctionsService,
    ) {
        super(drawingService, colorService, undoRedoPiles, magnetService, generalFunctions, gridService);
        this.initialize();
    }

    private findBoxDimensions(points: Vec2[]): void {
        const finalPoint = { x: 0, y: 0 };
        const initialPoint = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };

        // tslint:disable: prefer-for-of  | raison:  on veut parcourir les index du tableau points
        for (let i = 0; i < points.length; i++) {
            if (points[i].x < initialPoint.x) {
                initialPoint.x = points[i].x;
            }
            if (points[i].y < initialPoint.y) {
                initialPoint.y = points[i].y;
            }
            if (points[i].x > finalPoint.x) {
                finalPoint.x = points[i].x;
            }
            if (points[i].y > finalPoint.y) {
                finalPoint.y = points[i].y;
            }
        }
        if (
            (finalPoint.x !== 0 && finalPoint.y !== 0) ||
            (initialPoint.x !== this.drawingService.canvas.width && initialPoint.y !== this.drawingService.canvas.height)
        ) {
            this.initialPoint = initialPoint;
            this.finalPoint = finalPoint;
        }
    }

    private enableSelection(): void {
        if (this.lassoAttributes.isDoubleClicked) {
            this.findBoxDimensions(this.lassoAttributes.mouseClicks);
        }
    }

    private findBorder(): void {
        this.canvasVignete.width = this.selectionBox.width;
        this.canvasVignete.height = this.selectionBox.height;
        this.setLassoImage(this.selectionBox.imageContexte);
        this.setLassoImage(this.canvasVigneteCtx);
        this.setLassoUndoAttributes();
    }

    private setLassoUndoAttributes(): void {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCtx.drawImage(this.selectionBox.imageCanvas, 0, 0);
        this.lassoUndo = {
            name: SelectionMode.LASSO,
            segment: this.lassoAttributes.segment,
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: this.lassoAttributes.mouseClicks,
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
            image: this.selectionBox.image,
            width: this.selectionBox.width,
            height: this.selectionBox.height,
            topLeft: this.selectionBox.topLeft,
            initialPoint: this.selectionBox.initialPoint,
            imageCanvas: tempCanvas,
            imageContexte: tempCtx,
        };
    }

    private checkIsLastPoint(): void {
        if (!this.lassoAttributes.isLastPoint) {
            this.lassoAttributes.mainColor = 'black';
            this.lassoAttributes.secondaryColor = 'black';
            this.lassoAttributes.thickness = 1;
            this.lineService.drawLineWithJunctions(this.drawingService.previewCtx, this.lassoAttributes);
            this.lineService.drawSegment(this.lassoAttributes);
            this.lassoAttributes.isDoubleClicked = true;
        } else {
            this.enableSelection();
        }
    }

    private setLassoImage(ctx: CanvasRenderingContext2D): void {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCanvas.width = this.selectionBox.width;
        tempCanvas.height = this.selectionBox.height;
        tempCtx.putImageData(this.selectionBox.image, 0, 0);
        ctx.beginPath();
        ctx.moveTo(
            this.lassoAttributes.mouseClicks[0].x - this.initialPoint.x,

            this.lassoAttributes.mouseClicks[0].y - this.initialPoint.y,
        );
        for (let i = 1; i < this.lassoAttributes.mouseClicks.length; i++) {
            ctx.lineTo(this.lassoAttributes.mouseClicks[i].x - this.initialPoint.x, this.lassoAttributes.mouseClicks[i].y - this.initialPoint.y);
        }

        ctx.closePath();

        ctx.save();
        ctx.clip();

        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    }

    private removeLassoImage(ctx: CanvasRenderingContext2D, select: SelectionBox, lassoAttributes: LassoAttributes): void {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCanvas.width = select.width;
        tempCanvas.height = select.height;
        tempCtx.putImageData(select.image, 0, 0);
        ctx.beginPath();
        ctx.moveTo(
            lassoAttributes.mouseClicks[0].x,

            lassoAttributes.mouseClicks[0].y,
        );
        for (let i = 1; i < lassoAttributes.mouseClicks.length; i++) {
            ctx.lineTo(lassoAttributes.mouseClicks[i].x, lassoAttributes.mouseClicks[i].y);
        }

        ctx.closePath();

        ctx.save();
        ctx.clip();
        ctx.fillStyle = 'white';
        ctx.fillRect(select.initialPoint.x, select.initialPoint.y, select.image.width, select.image.height);
        ctx.restore();
    }

    protected clearImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {
        if (this.movePaste) {
            select = this.previousLassoBox;
        }
        if (this.lassoAttributes.isLastPoint) {
            this.removeLassoImage(ctx, select, this.lassoAttributes);
        }
    }

    protected getSelectedImage(controlPoints: ControlPoints, ctx: CanvasRenderingContext2D): void {
        super.getSelectedImage(controlPoints, ctx);
        this.clearLassoImage(this.drawingService.baseCtx, this.selectionBox);
        this.findBorder();
    }

    protected lineMouseDown(point: Vec2): void {
        if (!this.lassoAttributes.isLastPoint) {
            this.canCopy = false;
            this.canCut = false;
            this.canDelete = false;
            this.isSelectAll = false;
            this.lineService.isDrawing = true;
            this.lassoAttributes.mouseClicks.push(point);
            this.lineService.nbOfClicks = this.lassoAttributes.mouseClicks.length;
            if (this.lineService.nbOfClicks <= 1) {
                this.return = true;
                return;
            }
            this.lineService.onMousePosition(point, this.lassoAttributes, this.lineService.mouseTransition);
            if (this.lassoAttributes.isDoubleClicked) {
                this.lineService.getDistancePoints(this.lassoAttributes, 1);
            }
            this.checkIsLastPoint();
        } else {
            this.cancelSelection();
        }
    }

    protected lineMouseMove(point: Vec2): void {
        if (!this.isSelected && this.lineService.isDrawing) {
            this.lineService.lineDraw.thickness = this.lassoAttributes.thickness;
            this.lineService.lineDraw.ctx = this.drawingService.previewCtx;
            this.setContextStyle(this.drawingService.previewCtx);
            this.lassoAttributes.thickness = 1;
            if (this.lineService.isDrawing && !this.lassoAttributes.isLastPoint) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);

                this.lineService.onPositionMove(point, this.lassoAttributes);
            }
        }
    }

    protected lineMouseUp(): void {
        if (!this.isSelected) {
            if (this.lassoAttributes.isLastPoint) {
                this.setControlPoints(this.controlPoints);
                this.getSelectedImage(this.controlPoints, this.drawingService.baseCtx);
                this.setContextStyle(this.drawingService.previewCtx);
                this.drawSelectionBox(this.controlPoints, this.drawingService.previewCtx);
                this.drawControlPoints(this.controlPoints, this.drawingService.previewCtx);
                this.isSelected = true;

                this.selectionBox.initialPoint = this.initialPoint;
                this.lineService.isDrawing = false;
            }
        }
    }

    initialize(): void {
        this.selectionMode = SelectionMode.LASSO;
        this.initializeAttributes();
        this.return = false;
    }

    cancelSelection(): void {
        this.drawSelectedImage(this.drawingService.baseCtx, this.selectionBox);

        this.setLassoUndoAttributes();
        this.undoRedoPiles.handlePiles(this.lassoUndo);
        this.undoRedoPiles.setSelectedTool(false);
        this.drawingService.clearCanvas(this.canvasVigneteCtx);

        this.initializeAttributes();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.canCopy = false;
        this.canCut = false;
        this.canDelete = false;
    }

    async onKeyDown(event: KeyboardEvent): Promise<void> {
        if (!this.isSelected) {
            if (event.key === 'Escape') {
                this.initializeAttributes();
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.lineService.isDrawing = false;
            }
            if (event.key === 'Shift') {
                this.lineService.isShiftActive = true;
                this.lineMouseMove(this.mouseDownCoord);
            }
        } else {
            super.onKeyDown(event);
        }
    }

    async onKeyUp(event: KeyboardEvent): Promise<void> {
        if (!this.isSelected) {
            switch (event.key) {
                case 'Shift': {
                    this.lineService.isShiftActive = false;
                    this.lineMouseMove(this.mouseDownCoord);
                    break;
                }
                case 'Backspace': {
                    if (this.lineService.nbOfClicks > 1) {
                        this.lineService.removeLastLine(this.lassoAttributes);
                    }
                    break;
                }
            }
        } else {
            super.onKeyUp(event);
        }
    }

    updateLassoImage(ctx: CanvasRenderingContext2D, lassoUndoAttributes: LassoUndoAttributes): void {
        if (this.movePaste) {
            lassoUndoAttributes = this.previousLassoBox;
        }
        this.removeLassoImage(ctx, lassoUndoAttributes, lassoUndoAttributes);
    }

    updateLassoSelection(ctx: CanvasRenderingContext2D, lassoUndoAttributes: LassoUndoAttributes): void {
        if (this.movePaste) {
            lassoUndoAttributes = this.previousLassoBox;
        }
        ctx.drawImage(lassoUndoAttributes.imageCanvas, lassoUndoAttributes.topLeft.x, lassoUndoAttributes.topLeft.y);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }
}
