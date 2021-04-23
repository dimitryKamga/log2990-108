import { EventEmitter, Injectable } from '@angular/core';
import { CONTROL_POINTS_WIDTH, MODULO_FOUR } from '@app/classes/constants/draw-constants';
import { ControlPointId, MouseButton } from '@app/classes/enums/draw-enums';
import { ControlPoints, SelectionBox } from '@app/classes/interfaces/select-interface';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetService } from '@app/services/magnet/magnet.service';
import { SelectionMoveService } from '@app/services/tools/selection/selection-move/selection-move.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionResizeService extends SelectionMoveService {
    resizeRatio: Vec2;
    mousPosition: ControlPointId;
    tempControlPoints: ControlPoints;
    resizerStyle: EventEmitter<string>;
    tempCanvas: HTMLCanvasElement;
    tempCtx: CanvasRenderingContext2D;
    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        undoRedoPiles: UndoRedoPilesService,
        protected magnetService: MagnetService,
        protected generalFunctions: GeneralFunctionsService,
        protected gridService: GridService,
    ) {
        super(drawingService, colorService, undoRedoPiles, magnetService, generalFunctions, gridService);
        this.initializeAttributes();
    }

    private checkControlPoint(controlPoint: Vec2, point: Vec2, id: ControlPointId, bool: boolean): void {
        if (
            point.x >= controlPoint.x - CONTROL_POINTS_WIDTH &&
            point.x <= controlPoint.x + CONTROL_POINTS_WIDTH &&
            point.y >= controlPoint.y - CONTROL_POINTS_WIDTH &&
            point.y <= controlPoint.y + CONTROL_POINTS_WIDTH
        ) {
            if (bool) {
                this.controlPointId = id;
            } else {
                this.mousPosition = id;
            }
        }
    }

    private getControlPointId(controlPoints: ControlPoints, point: Vec2, bool: boolean): void {
        if (this.controlPointId > 0) {
            this.controlPointId = 0;
        }
        this.checkControlPoint(controlPoints.topLeft, point, ControlPointId.TOP_LEFT, bool);
        this.checkControlPoint(controlPoints.top, point, ControlPointId.TOP, bool);
        this.checkControlPoint(controlPoints.topRight, point, ControlPointId.TOP_RIGHT, bool);
        this.checkControlPoint(controlPoints.right, point, ControlPointId.RIGHT, bool);
        this.checkControlPoint(controlPoints.bottomRight, point, ControlPointId.BOTTOM_RIGHT, bool);
        this.checkControlPoint(controlPoints.bottom, point, ControlPointId.BOTTOM, bool);
        this.checkControlPoint(controlPoints.bottomLeft, point, ControlPointId.BOTTOM_LEFT, bool);
        this.checkControlPoint(controlPoints.left, point, ControlPointId.LEFT, bool);
    }

    private checkCornerPoints(point: Vec2): void {
        switch (this.controlPointId) {
            case ControlPointId.TOP_LEFT:
                this.initialPoint = point;
                break;
            case ControlPointId.BOTTOM_RIGHT:
                this.finalPoint = point;
                break;
            case ControlPointId.TOP_RIGHT:
                this.initialPoint.y = point.y;
                this.finalPoint.x = point.x;
                break;
            case ControlPointId.BOTTOM_LEFT:
                this.initialPoint.x = point.x;
                this.finalPoint.y = point.y;
        }
    }

    private checkSidePoints(point: Vec2): void {
        switch (this.controlPointId) {
            case ControlPointId.TOP:
                this.initialPoint.y = point.y;
                break;
            case ControlPointId.BOTTOM:
                this.finalPoint.y = point.y;
                break;
            case ControlPointId.RIGHT:
                this.finalPoint.x = point.x;
                break;
            case ControlPointId.LEFT:
                this.initialPoint.x = point.x;
        }
    }

    private getResizeRatio(initialPoint: Vec2, finalPoint: Vec2): void {
        let width = finalPoint.x - initialPoint.x;
        let height = finalPoint.y - initialPoint.y;
        if (this.shiftDown && width * height !== 0) {
            if (this.controlPointId % 2 === 1) {
                // Si c'est au coin
                const minWidth = this.generalFunctions.getShorterSide(width, height);
                width = this.generalFunctions.getDirection(width) * minWidth;
                height = this.generalFunctions.getDirection(height) * minWidth;
            } else {
                if (this.controlPointId % MODULO_FOUR === 0) {
                    // Si c'est top ou bottom
                    height = this.generalFunctions.getDirection(height) * Math.abs(width);
                } else {
                    width = this.generalFunctions.getDirection(width) * Math.abs(height);
                }
            }

            if (this.controlPointId <= ControlPointId.TOP_LEFT) {
                initialPoint.x = finalPoint.x - width;
            }
            if (this.controlPointId >= ControlPointId.TOP_LEFT && this.controlPointId <= ControlPointId.TOP_RIGHT) {
                initialPoint.y = finalPoint.y - height;
            }

            finalPoint.x = initialPoint.x + width;
            finalPoint.y = initialPoint.y + height;
        }
        this.resizeRatio.x = width / this.canvasVignete.width;
        this.resizeRatio.y = height / this.canvasVignete.height;
    }

    private resize(ctx: CanvasRenderingContext2D, selectionBox: SelectionBox): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.resizeImage(selectionBox);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
            selectionBox.imageCanvas,
            this.resizeRatio.x > 0 ? this.initialPoint.x : this.initialPoint.x - selectionBox.imageCanvas.width,
            this.resizeRatio.y > 0 ? this.initialPoint.y : this.initialPoint.y - selectionBox.imageCanvas.height,
        );
    }

    private mirrorimage(imageCtx: CanvasRenderingContext2D): void {
        const mirrorScale = { x: this.resizeRatio.x / Math.abs(this.resizeRatio.x), y: this.resizeRatio.y / Math.abs(this.resizeRatio.y) };
        const globalCompositeOperation = imageCtx.globalCompositeOperation;
        imageCtx.globalCompositeOperation = 'copy';
        imageCtx.scale(mirrorScale.x, mirrorScale.y);
        imageCtx.drawImage(this.canvasVignete, mirrorScale.x > 0 ? 0 : -imageCtx.canvas.width, mirrorScale.y > 0 ? 0 : -imageCtx.canvas.height);
        imageCtx.globalCompositeOperation = globalCompositeOperation;
        imageCtx.resetTransform();
    }

    private resizeImage(selectionBox: SelectionBox): void {
        this.isSelectAll = false;
        if (this.resizeRatio.x * this.resizeRatio.y !== 0) {
            this.tempCanvas.width = this.canvasVignete.width * Math.abs(this.resizeRatio.x);
            this.tempCanvas.height = this.canvasVignete.height * Math.abs(this.resizeRatio.y);
            this.tempCtx.save();
            this.tempCtx.imageSmoothingEnabled = true;
            this.tempCtx.imageSmoothingQuality = 'high';
            this.tempCtx.scale(this.resizeRatio.x, this.resizeRatio.y);
            this.tempCtx.drawImage(
                this.canvasVignete,
                this.resizeRatio.x > 0 ? 0 : -this.canvasVignete.width,
                this.resizeRatio.y > 0 ? 0 : -this.canvasVignete.height,
            );
            this.tempCtx.restore();
            selectionBox.imageCanvas = this.tempCanvas;
        }
    }

    private resizeSelection(point: Vec2): void {
        this.initialPoint = this.controlPoints.topLeft;
        this.finalPoint = this.controlPoints.bottomRight;
        this.checkCornerPoints(point);
        this.checkSidePoints(point);
        this.getResizeRatio(this.initialPoint, this.finalPoint);
    }

    private drawResizedSelection(ctx: CanvasRenderingContext2D): void {
        this.setControlPoints(this.tempControlPoints);
        this.setContextStyle(ctx);
        this.drawSelectionBox(this.tempControlPoints, ctx);
        this.drawControlPoints(this.tempControlPoints, ctx);
    }

    private getResizerStyle(controlPointId: ControlPointId): void {
        switch (controlPointId) {
            case ControlPointId.TOP_LEFT:
                this.resizerStyle.emit('nwse-resize');
                break;
            case ControlPointId.TOP:
                this.resizerStyle.emit('ns-resize');
                break;
            case ControlPointId.TOP_RIGHT:
                this.resizerStyle.emit('nesw-resize');
                break;
            case ControlPointId.RIGHT:
                this.resizerStyle.emit('ew-resize');
                break;
            case ControlPointId.BOTTOM_RIGHT:
                this.resizerStyle.emit('nwse-resize');
                break;
            case ControlPointId.BOTTOM:
                this.resizerStyle.emit('ns-resize');
                break;
            case ControlPointId.BOTTOM_LEFT:
                this.resizerStyle.emit('nesw-resize');
                break;
            case ControlPointId.LEFT:
                this.resizerStyle.emit('ew-resize');
                break;
            default:
                this.resizerStyle.emit('crosshair');
                break;
        }
    }

    updateSelection(ctx: CanvasRenderingContext2D, select: SelectionBox): void {
        select.imageContexte = select.imageCanvas.getContext('2d') as CanvasRenderingContext2D;
        const imageData = select.imageContexte.getImageData(0, 0, select.imageCanvas.width, select.imageCanvas.height);
        ctx.putImageData(imageData, select.topLeft.x, select.topLeft.y);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    initializeAttributes(): void {
        super.initializeAttributes();
        this.resizerStyle = new EventEmitter<string>();
        this.mousPosition = 0;
        this.resizeRatio = { x: 1, y: 1 };
        this.tempCanvas = document.createElement('canvas') as HTMLCanvasElement;
        this.tempCtx = this.tempCanvas.getContext('2d') as CanvasRenderingContext2D;

        this.tempControlPoints = {
            topLeft: { x: 0, y: 0 },
            top: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            right: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
            bottom: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            left: { x: 0, y: 0 },
        };
    }

    onMouseDown(event: MouseEvent): void {
        if (event.button === MouseButton.LEFT) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.getControlPointId(this.controlPoints, this.mouseDownCoord, true);
            this.resizeRatio = { x: 1, y: 1 };
            if (this.resizeCounter === 0 && this.controlPointId > 0) {
                this.clearImage(this.drawingService.baseCtx, this.selectionBox);
            }
            this.undoRedoPiles.setSelectedTool(true);
        }
        if (this.controlPointId <= 0) {
            super.onMouseDown(event);
        } else {
            if (this.movePaste || this.isCut) {
                this.selectionBox.imageCanvas = this.previousSelectionBox.imageCanvas;
                this.canvasVignete = this.previousSelectionBox.imageCanvas;
            }
            this.movePaste = false;
            this.isCut = false;
            this.getResizerStyle(this.controlPointId);
            this.resizeSelection(this.mouseDownCoord);
            this.resize(this.drawingService.previewCtx, this.selectionBox);
            this.drawResizedSelection(this.drawingService.previewCtx);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        if (this.controlPointId > 0) {
            this.resizeSelection(this.mouseDownCoord);
            this.resize(this.drawingService.previewCtx, this.selectionBox);
            this.drawResizedSelection(this.drawingService.previewCtx);
        } else {
            this.mousPosition = 0;
            this.getControlPointId(this.controlPoints, this.mouseDownCoord, false);
            this.getResizerStyle(this.mousPosition);
            super.onMouseMove(event);
        }
    }

    onMouseLeave(): void {
        if (this.controlPointId > 0) {
            this.setControlPoints(this.controlPoints);
            this.controlPointId = 0;
            if (this.resizeRatio.x < 0 || this.resizeRatio.y < 0) {
                this.mirrorimage(this.canvasVigneteCtx);
            }
            this.shiftDown = false;
        }
        super.onMouseLeave();
    }

    onMouseUp(event: MouseEvent): void {
        if (this.controlPointId > 0) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            if (this.resizeRatio.x !== 1 && this.resizeRatio.y !== 1) {
                this.resizeCounter++;
            }
            this.setControlPoints(this.controlPoints);
            if (this.resizeRatio.x < 0 || this.resizeRatio.y < 0) {
                this.mirrorimage(this.canvasVigneteCtx);
            }
            this.controlPointId = 0;
            this.shiftDown = false;
        } else {
            super.onMouseUp(event);
            this.undoRedoPiles.setSelectedTool(false);
        }
    }

    async onKeyDown(event: KeyboardEvent): Promise<void> {
        if (this.controlPointId > 0 && event.shiftKey) {
            this.shiftDown = true;
            this.resizeSelection(this.mouseDownCoord);
            this.resize(this.drawingService.previewCtx, this.selectionBox);
            this.drawResizedSelection(this.drawingService.previewCtx);
        } else {
            super.onKeyDown(event);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.controlPointId > 0 && !event.shiftKey) {
            this.shiftDown = false;
            this.resizeSelection(this.mouseDownCoord);
            this.resize(this.drawingService.previewCtx, this.selectionBox);
            this.drawResizedSelection(this.drawingService.previewCtx);
        } else {
            super.onKeyUp(event);
        }
    }
}
