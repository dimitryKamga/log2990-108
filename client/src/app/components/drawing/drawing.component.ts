import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DEFAULT_OPACITY, MIN_HEIGHT, MIN_WIDTH } from '@app/classes/constants/draw-constants';
import { SHORTCUTS_TABLE } from '@app/classes/constants/shortcuts-constants';
import { ToolLabels } from '@app/classes/interfaces/toolbar-interfaces';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LoadDrawingService } from '@app/services/drawing/load-drawing/load-drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { ResetToolsService } from '@app/services/reset-tools/reset-tools.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @ViewChild('baseCanvas', { static: false }) protected baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) protected previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) protected gridCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2;
    private resizingSize: Vec2;
    resizerStyle: string;
    tool: ToolLabels;
    destroyed: Subject<boolean>;

    constructor(
        private drawingService: DrawingService,
        private pencilService: PencilService,
        private drawingResizerService: DrawingResizerService,
        private toolManagementService: ToolManagementService,
        private undoRedoPilesService: UndoRedoPilesService,
        private colorService: ColorService,
        private selectRectangleService: SelectRectangleService,
        private selectEllipseService: SelectEllipseService,
        private gridService: GridService,
        private loadDrawingService: LoadDrawingService,
        private resetToolsService: ResetToolsService,
        private changeDetector: ChangeDetectorRef,
        private shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        this.initialize();
    }

    private initialize(): void {
        this.canvasSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        this.resizingSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        this.drawingResizerService.canvasSize = this.canvasSize;
        this.drawingResizerService.resizingLayerSize = this.resizingSize;

        this.toolManagementService.selectedTool = this.pencilService;
        this.destroyed = new Subject<boolean>();
    }

    ngOnInit(): void {
        this.undoRedoPilesService.reset();
    }

    ngAfterViewChecked(): void {
        this.changeDetector.detectChanges();
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.gridService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.gridService.gridCanvas = this.gridCanvas.nativeElement;
        this.colorService.primaryColor = this.colorService.hexToRGBA('#424263', DEFAULT_OPACITY);
        this.colorService.secondaryColor = this.colorService.hexToRGBA('#d49db2', DEFAULT_OPACITY);
        localStorage.length > 0 ? this.loadDrawingService.loadPreviousDrawing() : this.drawingResizerService.applyCanvasDefaultSize();

        this.drawingService.setPixelColor(this.canvasSize.x, this.canvasSize.y);

        this.selectRectangleService.resizerStyle.subscribe((style: string) => {
            this.resizerStyle = style;
        });
        this.selectEllipseService.resizerStyle.subscribe((style: string) => {
            this.resizerStyle = style;
        });

        this.resetToolsService.initializeTools();
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.toolManagementService.getSelectedToolOnMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.toolManagementService.getSelectedToolOnMouseDown(event);
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.toolManagementService.getSelectedToolOnMouseUp(event);
    }

    @HostListener('mousewheel', ['$event'])
    onMouseWheel(event: WheelEvent): void {
        this.toolManagementService.getSelectedToolOnMouseWheel(event);
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(): void {
        this.toolManagementService.getSelectedToolOnMouseLeave();
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (SHORTCUTS_TABLE.includes(event.key)) {
            this.shortcutsHandlerService.onKeyDown(event);
        }
        this.toolManagementService.getSelectedToolOnKeyDown(event);
    }

    @HostListener('document:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        this.toolManagementService.getSelectedToolOnKeyUp(event);
    }

    @HostListener('contextmenu', ['$event'])
    blockContextMenu(event: MouseEvent): void {
        event.preventDefault();
    }

    get resizingLayerWidth(): number {
        return this.resizingSize.x;
    }

    get resizingLayerHeight(): number {
        return this.resizingSize.y;
    }
    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    getResizingCanvasBorderStyle(): string {
        return this.drawingResizerService.getResizingLayerBorderStyle();
    }

    getSelectedToolName(): string {
        return this.toolManagementService.getSelectedToolName();
    }
}
