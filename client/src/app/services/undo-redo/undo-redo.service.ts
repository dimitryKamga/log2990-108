import { Injectable } from '@angular/core';
import { MainAttributes } from '@app/classes/interfaces/tools-attributes';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { Subject } from 'rxjs';
import { ToolCommandService } from './tool-command.service';
import { UndoRedoPilesService } from './undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService extends Tool {
    canUndo: boolean;
    undoSubject: Subject<boolean>;
    canRedo: boolean;
    redoObservable: Subject<boolean>;
    toolAttributes: MainAttributes;
    canvasX: number;
    canvasY: number;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        private drawingResizerService: DrawingResizerService,
        private undoRedoPiles: UndoRedoPilesService,
        private toolCommand: ToolCommandService,
        private selectEllipse: SelectEllipseService,
        private selectRectangle: SelectRectangleService,
        private lineService: LineService,
    ) {
        super(drawingService, colorService);
        this.initialize();
    }

    private initialize(): void {
        this.canRedo = false;
        this.canUndo = false;
        this.redoObservable = new Subject<boolean>();
        this.undoSubject = new Subject<boolean>();
    }

    private updateUndoPile(): void {
        const change = this.undoRedoPiles.undoPile.pop();
        if (change) {
            this.undoRedoPiles.redoPile.push(change);
        }
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.baseCtx.putImageData(this.drawingService.previousState, 0, 0);
        this.undoRedoPiles.undoPile.forEach((tool) => {
            this.toolCommand.executeCommand(tool);
        });
    }

    private updateRedoPile(): void {
        if (this.undoRedoPiles.redoPile.length) {
            const tool = this.undoRedoPiles.redoPile[this.undoRedoPiles.redoPile.length - 1];

            this.toolCommand.executeCommand(tool);
            const change = this.undoRedoPiles.redoPile.pop();
            this.undoRedoPiles.undoPile.push(change as MainAttributes);
        }
    }

    private updateActions(): void {
        this.updateUndoActions();
        this.updateRedoActions();
    }

    private updateUndoActions(): void {
        if (this.undoRedoPiles.undoPile.length) {
            this.canUndo = true;
            this.undoSubject.next(true);
        } else {
            this.canUndo = false;
            this.undoSubject.next(false);
        }
    }

    private updateRedoActions(): void {
        if (this.undoRedoPiles.redoPile.length) {
            this.canRedo = true;
            this.redoObservable.next(true);
        } else {
            this.canRedo = false;
            this.redoObservable.next(false);
        }
    }

    undo(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selectEllipse.initializeAttributes();
        this.selectRectangle.initializeAttributes();
        this.lineService.reset();

        const width = this.drawingResizerService.canvasSize.x;
        const height = this.drawingResizerService.canvasSize.y;

        this.drawingResizerService.resizeBaseCanvas(width, height);

        this.updateActions();
        if (!this.canUndo) {
            return;
        }
        this.updateUndoPile();
        this.updateActions();

        this.drawingService.autoSave();
    }

    redo(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.lineService.reset();
        this.updateActions();
        if (!this.canRedo) {
            return;
        }
        this.updateRedoPile();
        this.updateActions();
        this.drawingService.autoSave();
    }
}
