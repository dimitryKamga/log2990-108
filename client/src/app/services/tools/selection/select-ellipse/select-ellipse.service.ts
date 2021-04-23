import { Injectable } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SelectionMode } from '@app/classes/enums/draw-enums';
import { ControlPoints, SelectionBox, SelectionEllipse } from '@app/classes/interfaces/select-interface';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetService } from '@app/services/magnet/magnet.service';
import { SelectionResizeService } from '@app/services/tools/selection/selection-resize/selection-resize.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class SelectEllipseService extends SelectionResizeService {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.ELLIPSE_SELECTION;

    selectEllipseAttributes: SelectionEllipse;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        undoRedoPiles: UndoRedoPilesService,
        protected magnetService: MagnetService,
        protected generalFunctions: GeneralFunctionsService,
        protected gridService: GridService,
    ) {
        super(drawingService, colorService, undoRedoPiles, magnetService, generalFunctions, gridService);
        this.initialiseAttributes();
    }

    private setEllipseImage(): void {
        const colorSize = 4;
        for (let i = 1; i < this.selectionBox.image.data.length; i++) {
            const pixel = i / colorSize;
            const color = i % colorSize;
            const alpha = 3;
            const radius = {
                x: this.selectionBox.image.width / 2,
                y: this.selectionBox.image.height / 2,
            };
            const pixelDimensions = {
                x: ((pixel + 1) % this.selectionBox.image.width) - radius.x,
                y: (pixel + 1) / this.selectionBox.image.width + 1 - radius.y,
            };

            if (color === alpha && this.generalFunctions.checkOutsideEllipseSurface(pixelDimensions, radius)) {
                this.selectionBox.image.data[i] = 0;
            }
        }
    }

    protected drawSelectionBox(controlPoints: ControlPoints, ctx: CanvasRenderingContext2D): void {
        const width = controlPoints.bottomRight.x - controlPoints.topLeft.x;
        const height = controlPoints.bottomRight.y - controlPoints.topLeft.y;
        ctx.beginPath();
        ctx.ellipse(controlPoints.topLeft.x + width / 2, controlPoints.topLeft.y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2, false);
        ctx.stroke();
        if (this.boundingBox) {
            super.drawSelectionBox(controlPoints, ctx);
        }
    }

    protected getSelectedImage(controlPoints: ControlPoints, ctx: CanvasRenderingContext2D): void {
        super.getSelectedImage(controlPoints, ctx);
        this.setEllipseImage();
        this.setImage();
    }

    protected clearImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {
        if (this.movePaste) {
            select = this.previousSelectionBox;
        }
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(
            this.controlPoints.topLeft.x + select.image.width / 2,
            this.controlPoints.topLeft.y + select.image.height / 2,
            select.image.width / 2,
            select.image.height / 2,
            0,
            0,
            Math.PI * 2,
            false,
        );
        ctx.fill();
    }

    initialiseAttributes(): void {
        this.selectionMode = SelectionMode.ELLIPSE;

        this.initializeAttributes();

        this.selectEllipseAttributes = {
            name: SelectionMode.ELLIPSE,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
        };
    }

    updateImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {
        if (this.movePaste) {
            select = this.previousSelectionBox;
        }
        this.resizeCounter = 1;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(
            select.initialPoint.x + select.imageCanvas.width / 2,
            select.initialPoint.y + select.imageCanvas.height / 2,
            select.imageCanvas.width / 2,
            select.imageCanvas.height / 2,
            0,
            0,
            Math.PI * 2,
            false,
        );
        ctx.fill();
    }
}
