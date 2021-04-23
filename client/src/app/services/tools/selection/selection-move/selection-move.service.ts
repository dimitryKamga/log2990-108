import { Injectable } from '@angular/core';
import { FIVE_HUNDRED_MILLISECONDS, THREE_PIXELS } from '@app/classes/constants/draw-constants';
import { MouseButton, SelectionMode } from '@app/classes/enums/draw-enums';
import { Directions } from '@app/classes/enums/select-enums';
import { ControlPoints, SelectionBox } from '@app/classes/interfaces/select-interface';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetService } from '@app/services/magnet/magnet.service';
import { SelectService } from '@app/services/tools/selection/select/select.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionMoveService extends SelectService {
    mousePositionOnImage: Vec2;
    keyDown: boolean;
    toolLabel: string;
    anchors: Map<ControlPoints, Vec2>;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        undoRedoPiles: UndoRedoPilesService,
        protected magnetService: MagnetService,
        protected generalFunctions: GeneralFunctionsService,
        protected gridService: GridService,
    ) {
        super(drawingService, colorService, undoRedoPiles, generalFunctions);
        this.anchors = new Map<ControlPoints, Vec2>();
        this.initializeAttributes();
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async wait(ms: number): Promise<void> {
        await this.sleep(ms);
    }

    private checkMousePosition(position: Vec2): void {
        if (this.movePaste) {
            this.selectionBox = this.selectionMode === SelectionMode.LASSO ? this.previousLassoBox : this.previousSelectionBox;
        }
        if (position.x >= this.controlPoints.topLeft.x && position.x <= this.controlPoints.topLeft.x + this.selectionBox.imageCanvas.width) {
            if (position.y >= this.controlPoints.topLeft.y && position.y <= this.controlPoints.topLeft.y + this.selectionBox.imageCanvas.height) {
                this.mouseOnImage = true;
                this.mousePositionOnImage.x = position.x - this.controlPoints.topLeft.x;
                this.mousePositionOnImage.y = position.y - this.controlPoints.topLeft.y;
            } else {
                this.mouseOnImage = false;
            }
        } else {
            this.mouseOnImage = false;
        }
    }

    private moveImageWithMagnetism(a: number, b: number, c: number, d: number): void {
        if (this.magnetService.isEnabled) {
            this.moveImage(c, d);
        } else {
            this.moveImage(a, b);
        }
    }

    private calculateInitialPoint(x: number, y: number): Vec2 {
        let returnPoint = { x: 0, y: 0 };
        let point = { x: 0, y: 0 };
        let nearestPoint = { x: 0, y: 0 };
        const image = this.selectionBox.imageCanvas;
        switch (this.magnetService.anchor) {
            case Directions.NORTH_WEST:
                returnPoint = this.magnetService.nearestIntersection({ x, y });
                break;
            case Directions.NORTH:
                point = { x: x + image.width / 2, y };
                nearestPoint = this.magnetService.nearestIntersection(point);
                returnPoint = { x: nearestPoint.x - image.width / 2, y: nearestPoint.y };
                break;
            case Directions.NORTH_EAST:
                point = { x: x + image.width, y };
                nearestPoint = this.magnetService.nearestIntersection(point);
                returnPoint = { x: nearestPoint.x - image.width, y: nearestPoint.y };
                break;
            case Directions.WEST:
                point = { x, y: y + image.height / 2 };
                nearestPoint = this.magnetService.nearestIntersection(point);
                returnPoint = { x: nearestPoint.x, y: nearestPoint.y - image.height / 2 };
                break;
            case Directions.CENTER:
                point = { x: x + image.width / 2, y: y + image.height / 2 };
                nearestPoint = this.magnetService.nearestIntersection(point);
                returnPoint = { x: nearestPoint.x - image.width / 2, y: nearestPoint.y - image.height / 2 };
                break;
            case Directions.EAST:
                point = { x: x + image.width, y: y + image.height / 2 };
                nearestPoint = this.magnetService.nearestIntersection(point);
                returnPoint = { x: nearestPoint.x - image.width, y: nearestPoint.y - image.height / 2 };
                break;
            case Directions.SOUTH_WEST:
                point = { x, y: y + image.height };
                nearestPoint = this.magnetService.nearestIntersection(point);
                returnPoint = { x: nearestPoint.x, y: nearestPoint.y - image.height };
                break;
            case Directions.SOUTH:
                point = { x: x + image.width / 2, y: y + image.height };
                nearestPoint = this.magnetService.nearestIntersection(point);
                returnPoint = { x: nearestPoint.x - image.width / 2, y: nearestPoint.y - image.height };
                break;
            case Directions.SOUTH_EAST:
                point = { x: x + image.width, y: y + image.height };
                nearestPoint = this.magnetService.nearestIntersection(point);
                returnPoint = { x: nearestPoint.x - image.width, y: nearestPoint.y - image.height };
                break;
        }
        return returnPoint;
    }

    protected moveImage(x: number, y: number): void {
        this.isSelectAll = false;
        this.canCopy = false;

        if (this.movePaste) {
            this.selectionBox = this.selectionMode === SelectionMode.LASSO ? this.previousLassoBox : this.previousSelectionBox;
        }

        if (this.newSelection) {
            this.newSelection = false;
            this.selectionBox.initialPoint = this.controlPoints.topLeft;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            if (this.resizeCounter === 0) {
                this.clearImage(this.drawingService.baseCtx, this.selectionBox);
            }
        }
        if (this.magnetService.isEnabled) {
            this.initialPoint = this.calculateInitialPoint(x, y);
            this.finalPoint = {
                x: this.selectionBox.imageCanvas.width + this.initialPoint.x,
                y: this.selectionBox.imageCanvas.height + this.initialPoint.y,
            };
            this.setControlPoints(this.controlPoints);
            this.drawSelection(this.drawingService.previewCtx);
        } else {
            this.initialPoint = { x, y };
            this.finalPoint = {
                x: this.selectionBox.imageCanvas.width + this.initialPoint.x,
                y: this.selectionBox.imageCanvas.height + this.initialPoint.y,
            };
            this.setControlPoints(this.controlPoints);
            this.drawSelection(this.drawingService.previewCtx);
        }
    }

    // Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
    // tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (subscribe)
    protected clearImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {}
    protected clearLassoImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {}

    initializeAttributes(): void {
        super.initializeAttributes();
        this.mousePositionOnImage = { x: 0, y: 0 };
        this.mouseOnImage = false;
        this.keyDown = false;
    }

    drawSelection(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(ctx);
        this.setContextStyle(ctx);
        ctx.drawImage(
            this.selectionBox.imageCanvas,
            this.controlPoints.topLeft.x,
            this.controlPoints.topLeft.y,
            this.selectionBox.imageCanvas.width,
            this.selectionBox.imageCanvas.height,
        );
        this.drawSelectionBox(this.controlPoints, ctx);
        this.drawControlPoints(this.controlPoints, ctx);
    }

    onMouseDown(event: MouseEvent): void {
        if (event.button === MouseButton.LEFT) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.checkMousePosition(this.mouseDownCoord);
            this.undoRedoPiles.setSelectedTool(true);
        }
        if (this.mouseOnImage) {
            this.moveImage(this.mouseDownCoord.x - this.mousePositionOnImage.x, this.mouseDownCoord.y - this.mousePositionOnImage.y);
        } else {
            super.onMouseDown(event);
            this.newSelection = true;
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.onMouseEnter(event);
        if (event.button === MouseButton.LEFT && this.mouseOnImage) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.onMouseEnter(event);
            this.moveImage(this.mouseDownCoord.x - this.mousePositionOnImage.x, this.mouseDownCoord.y - this.mousePositionOnImage.y);
        }
        if (!this.mouseOnImage) {
            super.onMouseMove(event);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        if (event.buttons === 0 && !this.newSelection) {
            this.onMouseUp(event);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.undoRedoPiles.setSelectedTool(false);
        if (event.buttons === 0 && this.mouseOnImage) {
            this.mouseOnImage = false;
            this.resizeCounter = 1;
            if (this.movePaste || this.isCut) {
                this.canCopy = true;
                this.canPaste = true;
            }
        }
        if (!this.mouseOnImage) {
            super.onMouseUp(event);
        }
    }

    async onKeyDown(event: KeyboardEvent): Promise<void> {
        const topLeft = this.controlPoints.topLeft;
        const eventKey = event.key + this.isSelected.toString();
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        if (event.key === 'Delete') {
            this.delete();
        }
        if (eventKey === 'ArrowUptrue') {
            this.wait(FIVE_HUNDRED_MILLISECONDS);
            this.keyDown = true;
            this.moveImageWithMagnetism(topLeft.x, topLeft.y - THREE_PIXELS, topLeft.x, topLeft.y - this.gridService.squareSize);
        }
        if (eventKey === 'ArrowDowntrue') {
            this.wait(FIVE_HUNDRED_MILLISECONDS);
            this.keyDown = true;
            this.moveImageWithMagnetism(topLeft.x, topLeft.y + THREE_PIXELS, topLeft.x, topLeft.y + this.gridService.squareSize / 2);
        }

        if (eventKey === 'ArrowLefttrue') {
            this.wait(FIVE_HUNDRED_MILLISECONDS);
            this.keyDown = true;
            this.moveImageWithMagnetism(topLeft.x - THREE_PIXELS, topLeft.y, topLeft.x - this.gridService.squareSize, topLeft.y);
        }

        if (eventKey === 'ArrowRighttrue') {
            this.wait(FIVE_HUNDRED_MILLISECONDS);
            this.keyDown = true;
            this.moveImageWithMagnetism(topLeft.x + THREE_PIXELS, topLeft.y, topLeft.x + this.gridService.squareSize / 2, topLeft.y);
        }
        super.onKeyDown(event);
        this.undoRedoPiles.setSelectedTool(true);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.repeat && this.keyDown) {
            this.keyDown = false;
        }
        super.onKeyUp(event);
        this.undoRedoPiles.setSelectedTool(false);
    }

    drawSelectedImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {
        ctx.drawImage(select.imageCanvas, select.topLeft.x, select.topLeft.y);
    }

    copy(): void {
        if (this.selectionMode === SelectionMode.LASSO) {
            this.previousLassoBox.imageCanvas = this.selectionBox.imageCanvas;
            this.previousLassoBox.mouseClicks = this.lassoAttributes.mouseClicks;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelectedImage(this.drawingService.baseCtx, this.selectionBox);
            this.initializeLassoUndo();
        } else {
            this.previousSelectionBox.imageCanvas = this.selectionBox.imageCanvas;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelectedImage(this.drawingService.baseCtx, this.selectionBox);
        }
        this.canPaste = true;
        this.initializeAttributes();
    }

    cut(): void {
        this.clearImage(this.drawingService.baseCtx, this.selectionBox);
        if (this.selectionMode === SelectionMode.LASSO) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.previousLassoBox.imageCanvas = this.selectionBox.imageCanvas;
            this.previousLassoBox.mouseClicks = this.lassoAttributes.mouseClicks;

            this.canPaste = true;
            this.canDelete = false;
            this.initializeAttributes();
        } else {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.previousSelectionBox.imageCanvas = this.selectionBox.imageCanvas;
        }
        this.isCut = true;
        this.canPaste = true;
        this.canDelete = false;
        this.initializeAttributes();
    }
    paste(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        if (this.selectionMode === SelectionMode.LASSO) {
            this.selectionBox = this.previousLassoBox;
            this.lassoAttributes.mouseClicks = this.previousLassoBox.mouseClicks;
            this.canvasVignete = this.previousLassoBox.imageCanvas;
            this.lassoAttributes.isLastPoint = true;
        } else {
            this.selectionBox = this.previousSelectionBox;
        }
        this.resizeCounter = 1;
        this.movePaste = true;
        this.initialPoint = { x: 0, y: 0 };
        this.finalPoint = { x: this.selectionBox.imageCanvas.width, y: this.selectionBox.imageCanvas.height };
        this.setControlPoints(this.controlPoints);
        this.boundingBox = true;
        this.drawSelection(this.drawingService.previewCtx);
        this.isSelected = true;
        this.undoRedoPiles.setSelectedTool(false);
    }
    delete(): void {
        this.clearImage(this.drawingService.baseCtx, this.selectionBox);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.initialPoint = { x: 0, y: 0 };
        this.finalPoint = { x: 1, y: 1 };
        this.isSelected = false;
        this.selectionBox.imageCanvas = this.previousSelectionBox.imageCanvas;
        this.canDelete = false;
        this.canCut = false;
        this.canCopy = false;
        this.initializeAttributes();
        this.drawingService.autoSave();
    }
}
