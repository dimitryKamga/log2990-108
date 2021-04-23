import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FEATURES_SIDEBAR, TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetService } from '@app/services/magnet/magnet.service';
import { ModalService } from '@app/services/modals/modal.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { EyedropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { SelectService } from '@app/services/tools/selection/select/select.service';
import { SelectionMoveService } from '@app/services/tools/selection/selection-move/selection-move.service';
import { EllipseService } from '@app/services/tools/shape/ellipse/ellipse.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/shape/rectangle/rectangle.service';
import { SprayService } from '@app/services/tools/spray/spray.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextLogicService } from '@app/services/tools/text/text-logic.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ToolManagementService {
    toolsMap: Map<string, Tool>;
    selectedToolLabel: Subject<string>;
    selectedTool: Tool;

    private destroyed: Subject<boolean>;

    constructor(
        public shortcutsHandlerService: ShortcutsHandlerService,
        public modalService: ModalService,
        public pencilService: PencilService,
        public drawingService: DrawingService,
        public lineService: LineService,
        public rectangleService: RectangleService,
        public ellipseService: EllipseService,
        public selectRectangleService: SelectRectangleService,
        public selectEllipseService: SelectEllipseService,
        public selectLassoService: SelectLassoService,
        public selectionMoveService: SelectionMoveService,
        public polygonService: PolygonService,
        public eraserService: EraserService,
        public eyedropperService: EyedropperService,
        public sprayService: SprayService,
        public bucketService: BucketService,
        public dialog: MatDialog,
        public selectService: SelectService,
        public undoRedoService: UndoRedoService,
        public stampService: StampService,
        private undoRedoPiles: UndoRedoPilesService,
        private gridService: GridService,
        private textLogicService: TextLogicService,
        private magnetService: MagnetService,
    ) {
        this.selectedTool = pencilService;
        this.selectedToolLabel = new Subject<string>();
        this.destroyed = new Subject<boolean>();

        this.initialize();
        this.initializeMap();
    }
    private initialize(): void {
        this.shortcutsHandlerService
            .getShortcut()
            .pipe(takeUntil(this.destroyed))
            .subscribe((toolLabel) => {
                this.toolsMap.has(toolLabel) ? this.switchTool(toolLabel) : this.selectedFeature(toolLabel);
            });
    }

    private initializeMap(): void {
        this.toolsMap = new Map<string, Tool>([
            [TOOL_LABELS.PENCIL, this.pencilService],
            [TOOL_LABELS.LINE, this.lineService],
            [TOOL_LABELS.ELLIPSE, this.ellipseService],
            [TOOL_LABELS.RECTANGLE, this.rectangleService],
            [TOOL_LABELS.POLYGON, this.polygonService],
            [TOOL_LABELS.ERASER, this.eraserService],
            [TOOL_LABELS.EYE_DROPPER, this.eyedropperService],
            [TOOL_LABELS.SPRAY, this.sprayService],
            [TOOL_LABELS.BUCKET, this.bucketService],
            [TOOL_LABELS.ELLIPSE_SELECTION, this.selectEllipseService],
            [TOOL_LABELS.RECTANGLE_SELECTION, this.selectRectangleService],
            [TOOL_LABELS.LASSO, this.selectLassoService],
            [TOOL_LABELS.STAMP, this.stampService],
            [TOOL_LABELS.TEXT, this.textLogicService],
        ]);
    }

    private resetSelection(service: SelectService): void {
        if (service.isSelected) {
            service.drawSelectedImage(this.drawingService.baseCtx, service.selectionBox);
            this.undoRedoPiles.handlePiles(service.selectionBox);
            this.undoRedoPiles.setSelectedTool(false);
        }
        if (service instanceof SelectLassoService) {
            service.initializeLassoUndo();
        }
        service.initializeAttributes();
    }

    private isToolSelectionEllipse(tool: Tool, toolLabel: string): boolean {
        return tool instanceof SelectEllipseService || toolLabel === FEATURES_SIDEBAR.UNDO_LABEL || toolLabel === FEATURES_SIDEBAR.REDO_LABEL;
    }

    private isToolSelectionRectangle(tool: Tool, toolLabel: string): boolean {
        return tool instanceof SelectRectangleService || toolLabel === FEATURES_SIDEBAR.UNDO_LABEL || toolLabel === FEATURES_SIDEBAR.REDO_LABEL;
    }
    private isToolSelectionLasso(tool: Tool, toolLabel: string): boolean {
        return tool instanceof SelectLassoService || toolLabel === FEATURES_SIDEBAR.UNDO_LABEL || toolLabel === FEATURES_SIDEBAR.REDO_LABEL;
    }

    private selectedFeature(toolLabel: string): void {
        toolLabel === FEATURES_SIDEBAR.NEW_DRAWING_LABEL
            ? this.modalService.newDrawing()
            : toolLabel === FEATURES_SIDEBAR.EXPORT_DRAWING_LABEL
            ? this.modalService.openExportModal()
            : toolLabel === FEATURES_SIDEBAR.CARROUSEL_LABEL
            ? this.modalService.openCarrouselModal()
            : toolLabel === FEATURES_SIDEBAR.SELECT_ALL_LABEL
            ? this.switchWhenSelectAll()
            : toolLabel === FEATURES_SIDEBAR.UNDO_LABEL
            ? this.undoRedoService.undo()
            : toolLabel === FEATURES_SIDEBAR.REDO_LABEL
            ? this.undoRedoService.redo()
            : toolLabel === FEATURES_SIDEBAR.GRID
            ? this.gridService.setGridEnabler()
            : toolLabel === FEATURES_SIDEBAR.MAGNETISM
            ? this.activateMagnetism()
            : toolLabel === FEATURES_SIDEBAR.SAVE_LABEL
            ? this.modalService.openSavingModal()
            : this.switchSelectActions(toolLabel);
    }

    private switchSelectActions(action: string): void {
        switch (action) {
            case FEATURES_SIDEBAR.COPY:
                if (this.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION) {
                    this.verifyCopyState(this.selectRectangleService);
                }
                if (this.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION) {
                    this.verifyCopyState(this.selectEllipseService);
                }
                if (this.getSelectedToolName() === TOOL_LABELS.LASSO) {
                    this.verifyCopyState(this.selectLassoService);
                }
                break;

            case FEATURES_SIDEBAR.PASTE:
                if (this.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION) {
                    this.verifyPasteState(this.selectRectangleService);
                }
                if (this.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION) {
                    this.verifyPasteState(this.selectEllipseService);
                }
                if (this.getSelectedToolName() === TOOL_LABELS.LASSO) {
                    this.verifyPasteState(this.selectLassoService);
                }
                break;

            case FEATURES_SIDEBAR.CUT:
                if (this.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION) {
                    this.verifyCutState(this.selectRectangleService);
                }
                if (this.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION) {
                    this.verifyCutState(this.selectEllipseService);
                }
                if (this.getSelectedToolName() === TOOL_LABELS.LASSO) {
                    this.verifyCutState(this.selectLassoService);
                }
                break;
            default:
                break;
        }
    }

    private verifyCopyState(selectService: SelectService): void {
        if (selectService.isSelected) {
            selectService.copy();
        }
    }

    private verifyPasteState(selectService: SelectService): void {
        if (selectService.isSelected || selectService.canPaste) {
            selectService.paste();
        }
    }

    private verifyCutState(selectService: SelectService): void {
        if (selectService.isSelected) {
            selectService.cut();
        }
    }

    private switchWhenSelectAll(): void {
        this.switchTool(TOOL_LABELS.RECTANGLE_SELECTION);
        this.selectRectangleService.selectAll();
    }

    private activateMagnetism(): void {
        if (
            this.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION ||
            this.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION ||
            this.getSelectedToolName() === TOOL_LABELS.LASSO
        ) {
            this.magnetService.setMagnet();
        }
    }

    resetTools(toolLabel: string): void {
        if (this.selectedTool instanceof LineService && toolLabel !== TOOL_LABELS.LINE) {
            this.lineService.reset();
        }

        if (this.selectedTool instanceof TextLogicService && toolLabel !== TOOL_LABELS.TEXT) {
            this.textLogicService.reset();
        }
        if (this.isToolSelectionEllipse(this.selectedTool, toolLabel)) {
            this.resetSelection(this.selectEllipseService);
        }
        if (this.isToolSelectionRectangle(this.selectedTool, toolLabel)) {
            this.resetSelection(this.selectRectangleService);
        }
        if (this.isToolSelectionLasso(this.selectedTool, toolLabel)) {
            this.resetSelection(this.selectLassoService);
        }
    }

    switchTool(toolLabel: string): void {
        this.resetTools(toolLabel);
        const currentTool = this.toolsMap.get(toolLabel);

        if (currentTool) {
            this.selectedTool = currentTool;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.selectedToolLabel.next(toolLabel);
        }
    }

    getSelectedToolName(): string {
        return this.selectedTool.name;
    }

    getSelectedTool(): Observable<string> {
        return this.selectedToolLabel.asObservable();
    }

    getSelectedToolOnMouseMove(event: MouseEvent): void {
        this.selectedTool.onMouseMove(event);
    }

    getSelectedToolOnMouseDown(event: MouseEvent): void {
        this.selectedTool.onMouseDown(event);
    }

    getSelectedToolOnMouseUp(event: MouseEvent): void {
        this.selectedTool.onMouseUp(event);
    }

    getSelectedToolOnMouseWheel(event: WheelEvent): void {
        this.selectedTool.onMouseWheel(event);
    }

    getSelectedToolOnMouseLeave(): void {
        this.selectedTool.onMouseLeave();
    }

    getSelectedToolOnKeyDown(event: KeyboardEvent): void {
        this.selectedTool.onKeyDown(event);
    }

    getSelectedToolOnKeyUp(event: KeyboardEvent): void {
        this.selectedTool.onKeyUp(event);
    }
}
