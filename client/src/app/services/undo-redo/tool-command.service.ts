import { Injectable } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SelectionMode } from '@app/classes/enums/draw-enums';
import { SelectionBox } from '@app/classes/interfaces/select-interface';
import { ShapeAttributes } from '@app/classes/interfaces/shapes-attributes';
import {
    BucketAttributes,
    EraserAttributes,
    LassoUndoAttributes,
    LineAttributes,
    MainAttributes,
    PencilAttributes,
    ResizeAttributes,
    SprayAttributes,
    StampAttributes,
    TextAttributes,
} from '@app/classes/interfaces/tools-attributes';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { EllipseService } from '@app/services/tools/shape/ellipse/ellipse.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/shape/rectangle/rectangle.service';
import { SprayService } from '@app/services/tools/spray/spray.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';

@Injectable({
    providedIn: 'root',
})
export class ToolCommandService extends Tool {
    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        private lineService: LineService,
        private rectangleService: RectangleService,
        private polygonService: PolygonService,
        private ellipseService: EllipseService,
        private pencilService: PencilService,
        private eraserService: EraserService,
        private sprayService: SprayService,
        private drawingResizer: DrawingResizerService,
        private stampService: StampService,
        private selectRectangle: SelectRectangleService,
        private selectEllipse: SelectEllipseService,
        private selectLasso: SelectLassoService,
        private textService: TextService,
        private bucketService: BucketService,
    ) {
        super(drawingService, colorService);
    }
    executeCommand(tool: MainAttributes): void {
        switch (tool.name) {
            case TOOL_LABELS.RECTANGLE:
                this.rectangleService.draw(this.drawingService.baseCtx, tool as ShapeAttributes);
                break;
            case TOOL_LABELS.LINE:
                this.lineService.drawLineWithJunctions(this.drawingService.baseCtx, tool as LineAttributes);
                break;
            case TOOL_LABELS.POLYGON:
                this.polygonService.draw(this.drawingService.baseCtx, tool as ShapeAttributes);
                break;
            case TOOL_LABELS.ELLIPSE:
                this.ellipseService.draw(this.drawingService.baseCtx, tool as ShapeAttributes);
                break;
            case TOOL_LABELS.PENCIL:
                this.pencilService.drawPencil(this.drawingService.baseCtx, tool as PencilAttributes);
                break;
            case TOOL_LABELS.ERASER:
                this.eraserService.eraseLine(this.drawingService.baseCtx, tool as EraserAttributes);
                break;
            case TOOL_LABELS.SPRAY:
                this.sprayService.updateSprayAttributes(tool as SprayAttributes);
                break;
            case 'resizer':
                this.drawingResizer.updateCanvasData(tool as ResizeAttributes);
                break;
            case TOOL_LABELS.STAMP:
                this.stampService.drawStampIcon(this.drawingService.baseCtx, tool as StampAttributes);
                break;
            case TOOL_LABELS.TEXT:
                this.textService.updateText(tool as TextAttributes);
                break;
            case TOOL_LABELS.BUCKET:
                this.bucketService.updateBucketAttributes(tool as BucketAttributes);
                break;

            case SelectionMode.RECTANGLE:
                this.selectRectangle.updateImage(this.drawingService.baseCtx, tool as SelectionBox);
                this.selectRectangle.updateSelection(this.drawingService.baseCtx, tool as SelectionBox);
                break;
            case SelectionMode.ELLIPSE:
                this.selectEllipse.updateImage(this.drawingService.baseCtx, tool as SelectionBox);
                this.selectEllipse.updateSelection(this.drawingService.baseCtx, tool as SelectionBox);
                break;
            case SelectionMode.LASSO:
                this.selectLasso.updateLassoImage(this.drawingService.baseCtx, tool as LassoUndoAttributes);
                this.selectLasso.updateLassoSelection(this.drawingService.baseCtx, tool as LassoUndoAttributes);
        }
    }
}
