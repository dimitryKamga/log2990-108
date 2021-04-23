import { Injectable } from '@angular/core';
import { CONTROL_POINTS_WIDTH, DEFAULT_INITIAL_POINT, LINE_DASH, MAX_ALPHA } from '@app/classes/constants/draw-constants';
import { ControlPointId, MouseButton, SelectionMode } from '@app/classes/enums/draw-enums';
import { ControlPoints, SelectionBox } from '@app/classes/interfaces/select-interface';
import { LassoAttributes, LassoUndoAttributes } from '@app/classes/interfaces/tools-attributes';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard/clipboard.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides
// tslint:disable: file-line: max-file-line-count || raison: pour avoir atteint 350 lignes et faute de temps
// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant

@Injectable({
    providedIn: 'root',
})
export class SelectService extends ClipboardService {
    controlPoints: ControlPoints;
    selectionBox: SelectionBox;
    mouseOnImage: boolean;
    initialPoint: Vec2;
    finalPoint: Vec2;
    shiftDown: boolean;
    boundingBox: boolean;
    selectionMode: string;
    isSelected: boolean;
    resizeCounter: number;
    lassoAttributes: LassoAttributes;
    lassoUndo: LassoUndoAttributes;
    canvasVignete: HTMLCanvasElement;
    canvasVigneteCtx: CanvasRenderingContext2D;
    controlPointId: ControlPointId;
    isSelectAll: boolean;
    newSelection: boolean;
    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        protected undoRedoPiles: UndoRedoPilesService,
        protected generalFunctions: GeneralFunctionsService,
    ) {
        super(drawingService, colorService);
        this.initializeLassoUndo();
        this.initializeAttributes();
    }
    private setBackground(): void {
        const colorSize = 4;
        for (let i = 1; i < this.selectionBox.image.data.length; i++) {
            const color = i % colorSize;
            const alpha = 3;
            if (color === alpha && this.selectionBox.image.data[i] === 0) {
                this.selectionBox.image.data[i] = MAX_ALPHA;
                this.selectionBox.image.data[i - 1] = MAX_ALPHA;
                this.selectionBox.image.data[i - 2] = MAX_ALPHA;
                this.selectionBox.image.data[i - alpha] = MAX_ALPHA;
            }
        }
    }
    private drawSpecificControlPoint(point: Vec2, ctx: CanvasRenderingContext2D): void {
        ctx.rect(point.x - CONTROL_POINTS_WIDTH / 2, point.y - CONTROL_POINTS_WIDTH / 2, CONTROL_POINTS_WIDTH, CONTROL_POINTS_WIDTH);
    }

    protected setContextStyle(ctx: CanvasRenderingContext2D): void {
        ctx.setLineDash([LINE_DASH]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
    }
    protected drawControlPoints(controlPoints: ControlPoints, ctx: CanvasRenderingContext2D): void {
        ctx.setLineDash([]);
        ctx.beginPath();
        this.drawSpecificControlPoint(controlPoints.topLeft, ctx);
        this.drawSpecificControlPoint(controlPoints.top, ctx);
        this.drawSpecificControlPoint(controlPoints.topRight, ctx);
        this.drawSpecificControlPoint(controlPoints.right, ctx);
        this.drawSpecificControlPoint(controlPoints.bottomRight, ctx);
        this.drawSpecificControlPoint(controlPoints.bottom, ctx);
        this.drawSpecificControlPoint(controlPoints.bottomLeft, ctx);
        this.drawSpecificControlPoint(controlPoints.left, ctx);
        ctx.stroke();
        ctx.fill();
    }
    protected getSelectedImage(controlPoints: ControlPoints, ctx: CanvasRenderingContext2D): void {
        const initialPoint = controlPoints.topLeft;
        const finalPoint = controlPoints.bottomRight;
        this.selectionBox.image = ctx.getImageData(initialPoint.x, initialPoint.y, finalPoint.x - initialPoint.x, finalPoint.y - initialPoint.y);
        this.selectionBox.width = finalPoint.x - initialPoint.x;
        this.selectionBox.height = finalPoint.y - initialPoint.y;
        this.setBackground();
    }
    protected setImage(): void {
        this.selectionBox.imageCanvas.width = this.selectionBox.width;
        this.selectionBox.imageCanvas.height = this.selectionBox.height;
        this.selectionBox.imageContexte = this.selectionBox.imageCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.selectionBox.imageContexte.putImageData(this.selectionBox.image, 0, 0);
        this.canvasVignete.width = this.selectionBox.width;
        this.canvasVignete.height = this.selectionBox.height;
        this.canvasVigneteCtx.putImageData(this.selectionBox.image, 0, 0);
    }
    protected drawSelectionBox(controlPoints: ControlPoints, ctx: CanvasRenderingContext2D): void {
        this.selectionBox.width = controlPoints.bottomRight.x - controlPoints.topLeft.x;
        this.selectionBox.height = controlPoints.bottomRight.y - controlPoints.topLeft.y;
        ctx.beginPath();
        ctx.rect(controlPoints.topLeft.x, controlPoints.topLeft.y, this.selectionBox.width, this.selectionBox.height);
        ctx.stroke();
    }
    protected lineMouseMove(point: Vec2): void {}
    protected lineMouseDown(point: Vec2): void {}
    protected lineMouseUp(): void {}
    protected initializeLassoAttributes(): void {
        this.lassoAttributes = {
            name: SelectionMode.LASSO,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
        };
    }
    initializeAttributes(): void {
        this.initialPoint = { x: -1000, y: -1000 };
        this.finalPoint = { x: 0, y: 0 };
        this.shiftDown = false;
        this.boundingBox = false;
        this.newSelection = false;
        this.mouseOnImage = false;
        this.canvasVignete = document.createElement('canvas') as HTMLCanvasElement;
        this.canvasVigneteCtx = this.canvasVignete.getContext('2d') as CanvasRenderingContext2D;
        this.isSelected = false;
        this.resizeCounter = 0;
        this.controlPointId = 0;
        this.isSelectAll = true;
        this.initializeLassoAttributes();
        this.controlPoints = {
            topLeft: { x: DEFAULT_INITIAL_POINT, y: DEFAULT_INITIAL_POINT },
            top: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            right: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 },
            bottom: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            left: { x: 0, y: 0 },
        };
        this.selectionBox = {
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            mainColor: '',
            secondaryColor: '',
            name: this.selectionMode,
            thickness: 1,
            topLeft: { x: DEFAULT_INITIAL_POINT, y: DEFAULT_INITIAL_POINT },
            initialPoint: { x: DEFAULT_INITIAL_POINT, y: DEFAULT_INITIAL_POINT },
            imageCanvas: this.canvasVignete,
            imageContexte: this.canvasVigneteCtx,
        };
    }
    initializeLassoUndo(): void {
        this.lassoUndo = {
            name: SelectionMode.LASSO,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            topLeft: { x: 0, y: 0 },
            initialPoint: { x: 0, y: 0 },
            imageCanvas: this.canvasVignete,
            imageContexte: this.canvasVigneteCtx,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            if (this.selectionMode !== SelectionMode.LASSO) {
                if (this.isSelected) {
                    this.selectionBox.topLeft = this.controlPoints.topLeft;
                    if (this.movePaste || this.isCut) {
                        this.selectionBox = this.previousSelectionBox;
                    }
                    this.movePaste = false;
                    this.isCut = false;
                    this.drawSelectedImage(this.drawingService.baseCtx, this.selectionBox);
                    this.isSelectAll = false;
                    this.undoRedoPiles.handlePiles(this.selectionBox);
                    this.undoRedoPiles.setSelectedTool(false);
                    this.drawingService.autoSave();
                    this.resizeCounter = 0;
                }
                this.initialPoint = this.getPositionFromMouse(event);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.boundingBox = false;
            } else {
                if (this.movePaste || this.isCut) {
                    this.selectionBox = this.previousLassoBox;
                    this.lassoAttributes.isLastPoint = true;
                    this.resizeCounter = 1;
                }
                this.lineMouseDown(this.getPositionFromMouse(event));
                this.movePaste = false;
                this.isCut = false;
            }
        }
    }
    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            if (this.selectionMode !== SelectionMode.LASSO) {
                this.boundingBox = true;
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.finalPoint = this.getPositionFromMouse(event);
                if ((this.initialPoint.x !== this.finalPoint.x && this.initialPoint.y !== this.finalPoint.y) || this.lassoAttributes.isLastPoint) {
                    this.setControlPoints(this.controlPoints);
                    this.setContextStyle(this.drawingService.previewCtx);
                    this.drawSelectionBox(this.controlPoints, this.drawingService.previewCtx);
                    this.drawControlPoints(this.controlPoints, this.drawingService.previewCtx);
                    this.getSelectedImage(this.controlPoints, this.drawingService.baseCtx);
                    this.isSelected = true;
                } else {
                    this.canCopy = false;
                    this.canCut = false;
                    this.canDelete = false;
                    this.isSelectAll = false;
                    this.initializeAttributes();
                }
            } else {
                this.lineMouseUp();
            }
        }
        this.mouseDown = false;
        this.shiftDown = false;
    }
    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && this.selectionMode !== SelectionMode.LASSO) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.finalPoint = this.getPositionFromMouse(event);
            this.setControlPoints(this.controlPoints);
            this.setContextStyle(this.drawingService.previewCtx);
            this.drawSelectionBox(this.controlPoints, this.drawingService.previewCtx);
        } else {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.lineMouseMove(this.mouseDownCoord);
        }
    }
    onMouseLeave(): void {
        if (this.mouseDown) {
            this.boundingBox = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelectionBox(this.controlPoints, this.drawingService.previewCtx);
            this.drawControlPoints(this.controlPoints, this.drawingService.previewCtx);
            this.getSelectedImage(this.controlPoints, this.drawingService.baseCtx);
            this.isSelected = true;
        }
        this.mouseDown = false;
        this.shiftDown = false;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.mouseDown && event.key === 'Escape') {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.selectionBox.topLeft = this.controlPoints.topLeft;
            this.movePaste
                ? this.drawSelectedImage(this.drawingService.baseCtx, this.previousSelectionBox)
                : this.drawSelectedImage(this.drawingService.baseCtx, this.selectionBox);
            this.movePaste = false;
            this.drawingService.autoSave();
            this.undoRedoPiles.handlePiles(this.selectionBox);
            this.undoRedoPiles.setSelectedTool(false);
            this.canCopy = false;
            this.canCut = false;
            this.canDelete = false;
            this.initializeAttributes();
        } else if (this.mouseDown && event.shiftKey) {
            this.shiftDown = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.setControlPoints(this.controlPoints);
            this.drawSelectionBox(this.controlPoints, this.drawingService.previewCtx);
        }
    }
    onKeyUp(event: KeyboardEvent): void {
        if (this.mouseDown && !event.shiftKey) {
            this.shiftDown = false;
            this.setControlPoints(this.controlPoints);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelectionBox(this.controlPoints, this.drawingService.previewCtx);
        }
    }
    selectAll(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.initialPoint = { x: 2, y: 2 };
        this.finalPoint = { x: this.drawingService.canvas.width - 2, y: this.drawingService.canvas.height - 2 };
        this.setControlPoints(this.controlPoints);
        this.setContextStyle(this.drawingService.previewCtx);
        this.drawSelectionBox(this.controlPoints, this.drawingService.previewCtx);
        this.drawControlPoints(this.controlPoints, this.drawingService.previewCtx);
        this.getSelectedImage(this.controlPoints, this.drawingService.baseCtx);
        this.isSelected = true;
        this.newSelection = true;
    }
    drawSelectedImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {}
    resetClipboard(): void {
        this.previousSelectionBox = {
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            mainColor: '',
            secondaryColor: '',
            name: this.selectionMode,
            thickness: 1,
            topLeft: { x: 0, y: 0 },
            initialPoint: { x: 0, y: 0 },
            imageCanvas: this.canvasVignete,
            imageContexte: this.canvasVigneteCtx,
        };
        this.previousLassoBox = {
            name: SelectionMode.LASSO,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            topLeft: { x: 0, y: 0 },
            initialPoint: { x: 0, y: 0 },
            imageCanvas: this.canvasVignete,
            imageContexte: this.canvasVigneteCtx,
        };
    }
    setControlPoints(controlPoints: ControlPoints): void {
        let finalPoint = this.finalPoint;
        if (this.shiftDown && this.controlPointId === 0) {
            const width = this.finalPoint.x - this.initialPoint.x;
            const height = this.finalPoint.y - this.initialPoint.y;
            const squareWidth = this.generalFunctions.getShorterSide(width, height) * this.generalFunctions.getDirection(width);
            const squareHeight = this.generalFunctions.getShorterSide(width, height) * this.generalFunctions.getDirection(height);
            finalPoint = {
                x: this.initialPoint.x + squareWidth,
                y: this.initialPoint.y + squareHeight,
            };
        }
        const maxPoint = { x: Math.max(this.initialPoint.x, finalPoint.x), y: Math.max(this.initialPoint.y, finalPoint.y) };
        const minPoint = { x: Math.min(this.initialPoint.x, finalPoint.x), y: Math.min(this.initialPoint.y, finalPoint.y) };
        controlPoints.topLeft = { x: minPoint.x, y: minPoint.y };
        controlPoints.bottomRight = { x: maxPoint.x, y: maxPoint.y };
        controlPoints.topRight = { x: maxPoint.x, y: minPoint.y };
        controlPoints.bottomLeft = { x: minPoint.x, y: maxPoint.y };
        controlPoints.top = { x: minPoint.x + (maxPoint.x - minPoint.x) / 2, y: minPoint.y };
        controlPoints.bottom = { x: minPoint.x + (maxPoint.x - minPoint.x) / 2, y: maxPoint.y };
        controlPoints.left = { x: minPoint.x, y: minPoint.y + (maxPoint.y - minPoint.y) / 2 };
        controlPoints.right = { x: maxPoint.x, y: minPoint.y + (maxPoint.y - minPoint.y) / 2 };
        this.selectionBox.topLeft = controlPoints.topLeft;
    }
}
