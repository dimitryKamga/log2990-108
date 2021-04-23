import { Injectable } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SelectionMode } from '@app/classes/enums/draw-enums';
import { ControlPoints, SelectionBox, SelectionRectangle } from '@app/classes/interfaces/select-interface';
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
export class SelectRectangleService extends SelectionResizeService {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.RECTANGLE_SELECTION;

    selectRectangle: SelectionRectangle;
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

    protected clearImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {
        if (this.movePaste) {
            select = this.previousLassoBox;
        }
        ctx.fillStyle = 'white';
        ctx.fillRect(this.controlPoints.topLeft.x, this.controlPoints.topLeft.y, select.width, select.height);
    }

    protected getSelectedImage(controlPoints: ControlPoints, ctx: CanvasRenderingContext2D): void {
        super.getSelectedImage(controlPoints, ctx);
        this.setImage();
    }

    initialiseAttributes(): void {
        this.selectionMode = SelectionMode.RECTANGLE;
        this.initializeAttributes();

        this.selectRectangle = {
            name: SelectionMode.RECTANGLE,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
        };
    }
    updateImage(ctx: CanvasRenderingContext2D, select: SelectionBox): void {
        if (this.movePaste) {
            select = this.previousLassoBox;
        }
        this.resizeCounter = 1;
        ctx.fillStyle = 'white';
        ctx.fillRect(select.initialPoint.x, select.initialPoint.y, select.image.width, select.image.height);
    }
}
