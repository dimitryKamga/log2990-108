import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SHORTCUTS_TABLE } from '@app/classes/constants/shortcuts-constants';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LoadDrawingService } from '@app/services/drawing/load-drawing/load-drawing.service';
import { ResetToolsService } from '@app/services/reset-tools/reset-tools.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let drawingStub: DrawingService;
    let toolManagementServiceSpy: ToolManagementService;
    let resetToolsServiceSpy: jasmine.SpyObj<ResetToolsService>;
    let loadDrawingServiceSpy: jasmine.SpyObj<LoadDrawingService>;
    let drawingResizerServiceSpy: jasmine.SpyObj<DrawingResizerService>;
    let shortcutsHandlerServiceSpy: ShortcutsHandlerService;

    beforeEach(() => {
        drawingStub = new DrawingService();
        toolManagementServiceSpy = jasmine.createSpyObj('ToolManagementService', [
            'selectedTool',
            'getSelectedToolOnMouseMove',
            'getSelectedToolOnMouseDown',
            'getSelectedToolOnMouseUp',
            'getSelectedToolOnMouseLeave',
            'getSelectedToolOnKeyDown',
            'getSelectedToolOnKeyUp',
            'getSelectedToolName',
            'getSelectedToolOnMouseWheel',
        ]);

        resetToolsServiceSpy = jasmine.createSpyObj('ResetToolsService', ['initializeTools']);
        loadDrawingServiceSpy = jasmine.createSpyObj('LoadDrawingService', ['loadPreviousDrawing']);
        drawingResizerServiceSpy = jasmine.createSpyObj('DrawingResizerService', ['applyCanvasDefaultSize', 'getResizingLayerBorderStyle']);
        shortcutsHandlerServiceSpy = jasmine.createSpyObj('ShortcutHandlerService', ['onKeyDown']);

        TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [DrawingComponent],
            providers: [
                { provide: DrawingService, useValue: drawingStub },
                { provide: DrawingResizerService, useValue: drawingResizerServiceSpy },
                { provide: ToolManagementService, useValue: toolManagementServiceSpy },
                { provide: ResetToolsService, useValue: resetToolsServiceSpy },
                { provide: LoadDrawingService, useValue: loadDrawingServiceSpy },
                { provide: ShortcutsHandlerService, useValue: shortcutsHandlerServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['selectRectangleService'].resizerStyle.emit('ns-resize');
        component['selectEllipseService'].resizerStyle.emit('ns-resize');
        localStorage.setItem('data', drawingStub.baseCtx.canvas.toDataURL());
        localStorage.setItem('width', drawingStub.baseCtx.canvas.width.toString());
        localStorage.setItem('height', drawingStub.baseCtx.canvas.height.toString());
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create when localStorage is clear', () => {
        localStorage.clear();
        component.ngAfterViewInit();
        expect(component).toBeTruthy();
    });

    it('should create when localStorage is not clear', () => {
        component.ngAfterViewInit();
        expect(component).toBeTruthy();
    });

    it(' should call onMouseMove on a valid event', () => {
        const event = {} as MouseEvent;
        component.onMouseMove(event);
        expect(toolManagementServiceSpy.getSelectedToolOnMouseMove).toHaveBeenCalled();
    });

    it(' should call onMouseDown on a valid event', () => {
        const event = {} as MouseEvent;
        component.onMouseDown(event);
        expect(toolManagementServiceSpy.getSelectedToolOnMouseDown).toHaveBeenCalled();
    });

    it(' should call onMouseUp on a valid event', () => {
        const event = {} as MouseEvent;
        component.onMouseUp(event);
        expect(toolManagementServiceSpy.getSelectedToolOnMouseUp).toHaveBeenCalled();
    });

    it(' should call onMouseLeave on a valid event', () => {
        component.onMouseLeave();
        expect(toolManagementServiceSpy.getSelectedToolOnMouseLeave).toHaveBeenCalled();
    });

    it(' should call onKeyDown on a valid event', () => {
        const event = {} as KeyboardEvent;
        component.onKeyDown(event);
        expect(toolManagementServiceSpy.getSelectedToolOnKeyDown).toHaveBeenCalled();
    });

    it(' should call onMouseWheel on a valid event', () => {
        const event = {} as WheelEvent;
        component.onMouseWheel(event);
        expect(toolManagementServiceSpy.getSelectedToolOnMouseWheel).toHaveBeenCalled();
    });

    it(' should call onKeyUp on a valid event', () => {
        const event = {} as KeyboardEvent;
        component.onKeyUp(event);
        expect(toolManagementServiceSpy.getSelectedToolOnKeyUp).toHaveBeenCalled();
    });

    it(' should  always call preventDefault in order to block contextMenu on every mouseEvent', () => {
        const mouseEventSpy = jasmine.createSpyObj('MouseEvent', ['preventDefault']);
        component.blockContextMenu(mouseEventSpy);
        expect(mouseEventSpy.preventDefault).toHaveBeenCalled();
    });

    it(' should call onKeyDown on a valid event', () => {
        const event = {} as KeyboardEvent;
        component.onKeyDown(event);
        expect(toolManagementServiceSpy.getSelectedToolOnKeyDown).toHaveBeenCalled();
    });

    it(' should contain key event', () => {
        const event = new KeyboardEvent('keydown', { key: 'a' });
        component.onKeyDown(event);
        expect(SHORTCUTS_TABLE).toContain(event.key);
        expect(shortcutsHandlerServiceSpy.onKeyDown).toHaveBeenCalled();
    });
});
