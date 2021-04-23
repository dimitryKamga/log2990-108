import { Injectable } from '@angular/core';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResetToolsService } from '@app/services/reset-tools/reset-tools.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class ResetDrawingService {
    constructor(
        private drawingService: DrawingService,
        private drawingResizerService: DrawingResizerService,
        private undoService: UndoRedoPilesService,
        private resetToolsService: ResetToolsService,
    ) {}

    resetDrawing(isReset: boolean): void {
        if (isReset) {
            this.drawingResizerService.applyCanvasDefaultSize();
            this.drawingService.setPixelColor(this.drawingService.canvas.width, this.drawingService.canvas.height);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.resetToolsService.initializeTools();
            this.undoService.reset();
            localStorage.clear();
        }
    }
}
