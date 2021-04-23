import { Injectable } from '@angular/core';
import {
    BOTTOM_RESIZER_DIMENSIONS,
    CONTAINER_MIN_HEIGHT,
    CONTAINER_MIN_WIDTH,
    CORNER_DIVIDER,
    CORNER_RESIZER_DIMENSIONS,
    INITIAL_DIMENSIONS_RATIO,
    MIN_HEIGHT,
    MIN_WIDTH,
    PHYSICAL_RESIZER_DIMENSIONS,
} from '@app/classes/constants/draw-constants';
import { MouseButton, ResizerLocation } from '@app/classes/enums/draw-enums';
import { ResizeAttributes } from '@app/classes/interfaces/tools-attributes';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class DrawingResizerService {
    resizerLocation: ResizerLocation;
    workSpaceSize: Vec2;
    canvasSize: Vec2;
    resizingLayerSize: Vec2;
    canvasImageData: ImageData;
    gridImageData: ImageData;

    private resizerStyles: Map<ResizerLocation, string | undefined>;
    private resizingLayerBorderStyles: Map<ResizerLocation, string>;

    private resizeAttributes: ResizeAttributes;

    private mouseDown: boolean;
    private lastPosition: Vec2;

    constructor(
        private drawingService: DrawingService,
        private undoRedoPiles: UndoRedoPilesService,
        private shortcutHandler: ShortcutsHandlerService,
        private gridService: GridService,
    ) {
        this.initialize();
    }

    private initialize(): void {
        this.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        this.canvasSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        this.workSpaceSize = { x: CONTAINER_MIN_WIDTH, y: CONTAINER_MIN_HEIGHT };
        this.resizerLocation = ResizerLocation.NONE;
    }

    private updateResizeAttributes(): void {
        this.resizeAttributes = {
            name: 'resizer',
            canvasSize: { x: this.resizingLayerSize.x, y: this.resizingLayerSize.y },
            imageData: this.canvasImageData,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
        };
    }

    private initializeResizerStyleMap(): void {
        this.resizerStyles = new Map([
            [ResizerLocation.RIGHT, this.getRightResizerStyle()],
            [ResizerLocation.CORNER, this.getCornerResizerStyle()],
            [ResizerLocation.BOTTOM, this.getBottomResizerStyle()],
        ]);
    }

    private initializeResizingLayerBorderStyles(): void {
        const noneStyle = '1px solid';
        const resizingStyle = '2px dotted';
        this.resizingLayerBorderStyles = new Map([
            [ResizerLocation.NONE, noneStyle],
            [ResizerLocation.RIGHT, resizingStyle],
            [ResizerLocation.CORNER, resizingStyle],
            [ResizerLocation.BOTTOM, resizingStyle],
        ]);
    }
    private resizeResizingLayer(event: MouseEvent): void {
        const newPosition: Vec2 = { x: event.clientX, y: event.clientY };
        this.shortcutHandler.isShortcutKeyEnabled = false;
        if (this.resizerLocation !== ResizerLocation.NONE) {
            switch (this.resizerLocation) {
                case ResizerLocation.RIGHT:
                    this.resizeRight(newPosition);
                    break;
                case ResizerLocation.CORNER:
                    this.resizeCorner(newPosition);
                    break;
                case ResizerLocation.BOTTOM:
                    this.resizeBottom(newPosition);
                    break;
            }
        }
    }

    private resizeRight(newPosition: Vec2): void {
        const x = Math.min(this.resizingLayerSize.x + newPosition.x - this.lastPosition.x, this.workSpaceSize.x);
        this.resizingLayerSize.x = Math.max(x, MIN_WIDTH);
        this.lastPosition.x = newPosition.x;
    }

    private resizeCorner(newPosition: Vec2): void {
        const x = Math.min(this.resizingLayerSize.x + newPosition.x - this.lastPosition.x, this.workSpaceSize.x);
        const y = Math.min(this.resizingLayerSize.y + newPosition.y - this.lastPosition.y, this.workSpaceSize.y);
        this.resizingLayerSize.x = Math.max(x, MIN_WIDTH);
        this.resizingLayerSize.y = Math.max(y, MIN_HEIGHT);
        this.lastPosition = newPosition;
    }

    private resizeBottom(newPosition: Vec2): void {
        const y = Math.min(this.resizingLayerSize.y + newPosition.y - this.lastPosition.y, this.workSpaceSize.y);
        this.resizingLayerSize.y = Math.max(y, MIN_HEIGHT);
        this.lastPosition.y = newPosition.y;
    }

    private getRightResizerStyle(): string {
        const top = this.resizingLayerSize.y / 2 - PHYSICAL_RESIZER_DIMENSIONS / 2 + 'px';

        const left = this.resizingLayerSize.x - 1 / 2 + 'px';

        return `left: ${left}; top: ${top}; width: ${PHYSICAL_RESIZER_DIMENSIONS + 'px'}; height: ${
            PHYSICAL_RESIZER_DIMENSIONS + 'px'
        }; cursor: ew-resize`;
    }

    private getBottomResizerStyle(): string {
        const top = this.resizingLayerSize.y - BOTTOM_RESIZER_DIMENSIONS / 2 + 'px';

        const left = this.resizingLayerSize.x / 2 - PHYSICAL_RESIZER_DIMENSIONS / 2 + 'px';

        return `left: ${left}; top: ${top}; width: ${PHYSICAL_RESIZER_DIMENSIONS + 'px'}; height: ${
            PHYSICAL_RESIZER_DIMENSIONS + 'px'
        }; cursor: ns-resize`;
    }

    private getCornerResizerStyle(): string {
        const top = this.resizingLayerSize.y - CORNER_RESIZER_DIMENSIONS / CORNER_DIVIDER + 'px';

        const left = this.resizingLayerSize.x - CORNER_RESIZER_DIMENSIONS / CORNER_DIVIDER + 'px';

        return `left: ${left}; top: ${top}; width: ${PHYSICAL_RESIZER_DIMENSIONS + 'px'}; height: ${
            PHYSICAL_RESIZER_DIMENSIONS + 'px'
        }; cursor: nwse-resize`;
    }

    resizeBaseCanvas(width: number, height: number): void {
        this.canvasImageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const previewCanvas = this.drawingService.previewCtx.getImageData(0, 0, width, height);

        this.drawingService.canvas.width = width;
        this.drawingService.canvas.height = height;

        this.gridService.gridCanvas.width = width;
        this.gridService.gridCanvas.height = height;

        this.resizingLayerSize.x = width;
        this.resizingLayerSize.y = height;

        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawingService.baseCtx.fillRect(0, 0, this.resizingLayerSize.x, this.resizingLayerSize.y);

        this.drawingService.baseCtx.putImageData(this.canvasImageData, 0, 0);
        this.drawingService.previewCtx.putImageData(previewCanvas, 0, 0);
        this.shortcutHandler.isShortcutKeyEnabled = true;

        // pour la gestion des carreaux de la grille quand elle est activee
        this.gridService.gridHandler();
        this.updateResizeAttributes();
    }

    applyCanvasDefaultSize(): void {
        const width = this.workSpaceSize.x <= CONTAINER_MIN_WIDTH ? MIN_WIDTH : this.workSpaceSize.x / INITIAL_DIMENSIONS_RATIO;
        const height = this.workSpaceSize.y <= CONTAINER_MIN_HEIGHT ? MIN_HEIGHT : this.workSpaceSize.y / INITIAL_DIMENSIONS_RATIO;

        this.canvasSize.x = width;
        this.canvasSize.y = height;

        this.resizingLayerSize.x = width;
        this.resizingLayerSize.y = height;

        this.resizeBaseCanvas(width, height);
    }

    onMouseUp(): void {
        if (this.mouseDown) {
            this.resizeBaseCanvas(this.resizingLayerSize.x, this.resizingLayerSize.y);
            this.resizerLocation = ResizerLocation.NONE;
            this.undoRedoPiles.handlePiles(this.resizeAttributes);
            this.drawingService.autoSave();
        }
        this.mouseDown = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.lastPosition = { x: event.clientX, y: event.clientY };
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.resizeResizingLayer(event);
        }
    }

    getResizingLayerBorderStyle(): string {
        this.initializeResizingLayerBorderStyles();
        return this.resizingLayerBorderStyles.get(this.resizerLocation) as string;
    }

    getResizerStyle(resizerLocation: ResizerLocation): string | undefined {
        this.initializeResizerStyleMap();
        return this.resizerStyles.get(resizerLocation);
    }

    updateCanvasData(resizeAttributes: ResizeAttributes): void {
        this.resizeBaseCanvas(resizeAttributes.canvasSize.x, resizeAttributes.canvasSize.y);
        this.drawingService.baseCtx.putImageData(resizeAttributes.imageData, 0, 0);
    }
}
