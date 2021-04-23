import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { FEATURES_SIDEBAR, TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { LineFunctionsService } from '@app/classes/mathematics/line-functions.service';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetService } from '@app/services/magnet/magnet.service';
import { ModalService } from '@app/services/modals/modal.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { SelectService } from '@app/services/tools/selection/select/select.service';
import { EllipseService } from '@app/services/tools/shape/ellipse/ellipse.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/shape/rectangle/rectangle.service';
import { TextLogicService } from '@app/services/tools/text/text-logic.service';
import { TextService } from '@app/services/tools/text/text.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { of, Subject } from 'rxjs';

import SpyObj = jasmine.SpyObj;

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

class Mock extends Tool {
    constructor(name: string) {
        super({} as DrawingService, {} as ColorService);
        this.name = name;
    }
}

describe('ToolManagementService', () => {
    const obs = new Subject<string>();

    let service: ToolManagementService;
    let shortcutsHandlerServiceSpy: SpyObj<ShortcutsHandlerService>;
    let drawingServiceSpy: SpyObj<DrawingService>;
    let gridServiceSpy: SpyObj<GridService>;
    let modalServiceServiceSpy: ModalService;
    let lineServiceSpy: LineService;
    let textLogicService: TextLogicService;
    let selectRectangleSpy: SelectRectangleService;
    let selectEllipseSpy: SelectEllipseService;
    let selectionServiceSpy: SpyObj<SelectService>;
    let undoRedoServiceSpy: UndoRedoService;
    let baseCtxStub: CanvasRenderingContext2D;
    let baseCtxxStub: CanvasRenderingContext2D;
    let previewCtxxStub: CanvasRenderingContext2D;
    let canvasTestHelper: HTMLCanvasElement;
    let magnetServiceSpy: SpyObj<MagnetService>;

    beforeEach(() => {
        shortcutsHandlerServiceSpy = jasmine.createSpyObj('ShortcutsHandlerService', ['getShortcut']);
        shortcutsHandlerServiceSpy.getShortcut.and.returnValue(obs.asObservable());
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['openWarning', 'clearCanvas', 'getIsToolInUse', 'canvas', 'baseCtx']);
        modalServiceServiceSpy = jasmine.createSpyObj('ModalService', ['newDrawing', 'openExportModal', 'openSavingModal', 'openCarrouselModal']);
        selectionServiceSpy = jasmine.createSpyObj('SelectService', ['selectAll']);
        gridServiceSpy = jasmine.createSpyObj('GridService', ['setGridEnabler']);
        magnetServiceSpy = jasmine.createSpyObj('magnetService', ['setMagnet']);
        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtxxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasTestHelper = document.createElement('canvas') as HTMLCanvasElement;

        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['undo', 'redo']);
        lineServiceSpy = new LineService(
            drawingServiceSpy,
            {} as GeneralFunctionsService,
            {} as LineFunctionsService,
            {} as ColorService,
            {} as UndoRedoPilesService,
            {} as ShortcutsHandlerService,
        );
        selectRectangleSpy = new SelectRectangleService(
            drawingServiceSpy,
            {} as ColorService,
            {} as UndoRedoPilesService,
            {} as MagnetService,
            {} as GeneralFunctionsService,
            {} as GridService,
        );
        selectEllipseSpy = new SelectEllipseService(
            drawingServiceSpy,
            {} as ColorService,
            {} as UndoRedoPilesService,
            {} as MagnetService,
            {} as GeneralFunctionsService,
            {} as GridService,
        );
        textLogicService = new TextLogicService(
            drawingServiceSpy,
            {} as ColorService,
            {} as ShortcutsHandlerService,
            {} as UndoRedoPilesService,
            {} as TextService,
        );

        TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserAnimationsModule, HttpClientModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ShortcutsHandlerService, useValue: shortcutsHandlerServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: PencilService, useValue: new Mock(TOOL_LABELS.PENCIL) },
                { provide: ModalService, useValue: modalServiceServiceSpy },
                { provide: SelectService, useValue: selectionServiceSpy },
                { provide: RectangleService, useValue: new Mock(TOOL_LABELS.RECTANGLE) },
                { provide: EllipseService, useValue: new Mock(TOOL_LABELS.ELLIPSE) },
                { provide: PolygonService, useValue: new Mock(TOOL_LABELS.POLYGON) },
                { provide: LineService, useValue: lineServiceSpy },
                { provide: TextLogicService, useValue: textLogicService },
                { provide: SelectRectangleService, useValue: selectRectangleSpy },
                { provide: SelectEllipseService, useValue: selectEllipseSpy },
                { provide: EraserService, useValue: new Mock(TOOL_LABELS.ERASER) },
                { provide: MatSnackBar, useValue: {} },
                { provide: HttpClientModule, useValue: {} },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
                { provide: GridService, useValue: gridServiceSpy },
                { provide: MagnetService, useValue: magnetServiceSpy },
            ],
        });
        service = TestBed.inject(ToolManagementService);
        service['drawingService'].baseCtx = baseCtxStub;
        service['selectRectangleService']['drawingService'].baseCtx = baseCtxxStub;
        service['selectRectangleService']['drawingService'].previewCtx = previewCtxxStub;
        service['selectRectangleService']['drawingService'].canvas = canvasTestHelper;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should switch tool', () => {
        service.switchTool(TOOL_LABELS.PENCIL);
        expect(service.selectedTool.name).toBe(TOOL_LABELS.PENCIL);
    });

    it('should selecte feature new drawing', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.NEW_DRAWING_LABEL);
        expect(modalServiceServiceSpy.newDrawing).toHaveBeenCalled();
    });

    it('should not selecte feature new drawing', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.CARROUSEL_LABEL);
        expect(modalServiceServiceSpy.newDrawing).not.toHaveBeenCalled();
    });

    it('should select feature export', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.EXPORT_DRAWING_LABEL);
        expect(modalServiceServiceSpy.openExportModal).toHaveBeenCalled();
    });

    it('should not select feature export', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.CARROUSEL_LABEL);
        expect(modalServiceServiceSpy.openExportModal).not.toHaveBeenCalled();
    });

    it('should selecte feature select all', () => {
        const selectAllSpy = spyOn(selectRectangleSpy, 'selectAll').and.callThrough();
        service['selectedFeature'](FEATURES_SIDEBAR.SELECT_ALL_LABEL);
        expect(selectAllSpy).toHaveBeenCalled();
    });

    it('should select feature carrousel', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.CARROUSEL_LABEL);
        expect(modalServiceServiceSpy.openCarrouselModal).toHaveBeenCalled();
    });

    it('should select feature grid', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.GRID);
        expect(gridServiceSpy.setGridEnabler).toHaveBeenCalled();
    });

    it('should call magnetService.enableMagnet if selectedtool = selectionEllipse', () => {
        service.selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        service['selectedFeature'](FEATURES_SIDEBAR.MAGNETISM);
        expect(magnetServiceSpy.setMagnet).toHaveBeenCalled();
    });

    it('should call magnetService.enableMagnet if selectedtool = selectionRectangle', () => {
        service.selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        service['selectedFeature'](FEATURES_SIDEBAR.MAGNETISM);
        expect(magnetServiceSpy.setMagnet).toHaveBeenCalled();
    });

    it('should not call magnetService.enableMagnet if selectedtool = pencil', () => {
        service.selectedTool.name = TOOL_LABELS.PENCIL;
        service['selectedFeature'](FEATURES_SIDEBAR.MAGNETISM);
        expect(magnetServiceSpy.setMagnet).not.toHaveBeenCalled();
    });

    it('should select feature carrousel', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.CARROUSEL_LABEL);
        expect(modalServiceServiceSpy.openCarrouselModal).toHaveBeenCalled();
    });

    it('should undo', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.UNDO_LABEL);
        expect(undoRedoServiceSpy.undo).toHaveBeenCalled();
    });

    it('should redo', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.REDO_LABEL);
        expect(undoRedoServiceSpy.redo).toHaveBeenCalled();
    });

    it('should get selected tool name', () => {
        expect(service.getSelectedToolName()).toBe(service.selectedTool.name);
    });

    it('should get selected tool', () => {
        expect(service.getSelectedTool()).toEqual(service.selectedToolLabel.asObservable());
    });

    it('should not switch current tool if selected tool is different', () => {
        service.switchTool('invalid tool label');
        expect(service.selectedTool.name).toBe(TOOL_LABELS.PENCIL);
    });

    it('should reset line if selected tool is different than line', () => {
        const spy = spyOn(lineServiceSpy, 'reset');
        service.selectedTool = lineServiceSpy;
        service.switchTool(TOOL_LABELS.PENCIL);
        expect(service.selectedTool.name).toBe(TOOL_LABELS.PENCIL);
        expect(spy).toHaveBeenCalled();
    });

    it('should reset text if selected tool is different than text', () => {
        const spy = spyOn(textLogicService, 'reset');
        service.selectedTool = textLogicService;
        service['resetTools']('text');
        expect(service.selectedTool.name).toBe(TOOL_LABELS.TEXT);
        expect(spy).toHaveBeenCalled();
    });

    it('should include toolLabel', () => {
        shortcutsHandlerServiceSpy.getShortcut.and.returnValue(of(TOOL_LABELS.PENCIL));
        service['initialize']();
        expect(service.switchTool(TOOL_LABELS.PENCIL)).toEqual();
    });

    it('should not include toolLabel', () => {
        shortcutsHandlerServiceSpy.getShortcut.and.returnValue(of('brosse'));
        service['initialize']();
        expect(service.switchTool('brosse')).toEqual();
    });

    it('should return selectedToolName.asObservable', () => {
        expect(service.getSelectedTool()).toEqual(service.selectedToolLabel.asObservable());
    });

    it('should reset tools selection Ellipse when another tool is selected', () => {
        const spy = spyOn<any>(service, 'resetSelection').and.callThrough();
        selectEllipseSpy.isSelected = true;
        service.selectedTool = selectEllipseSpy;
        service['resetTools']('ellipse');
        expect(spy).toHaveBeenCalled();
    });

    it('should reset tools selection Rectangle when another tool is selected', () => {
        const spy = spyOn<any>(service, 'resetSelection').and.callThrough();
        selectRectangleSpy.isSelected = true;
        service.selectedTool = selectRectangleSpy;
        service['resetTools']('rectangle');
        expect(spy).toHaveBeenCalled();
    });

    it('should reset tools selection Ellipse when another tool is selected is false', () => {
        const spy = spyOn<any>(service, 'resetSelection').and.callThrough();
        selectEllipseSpy.isSelected = false;
        service.selectedTool = selectEllipseSpy;
        service['resetTools']('ellipse');
        expect(spy).toHaveBeenCalled();
    });

    it('should reset tools selection Rectangle when another tool is selected is false', () => {
        const spy = spyOn<any>(service, 'resetSelection').and.callThrough();
        selectRectangleSpy.isSelected = false;
        service.selectedTool = selectRectangleSpy;
        service['resetTools']('rectangle');
        expect(spy).toHaveBeenCalled();
    });

    it('should call selected tool on a onMouseMove event', () => {
        const event = {} as MouseEvent;
        const onMouseMoveSpy = spyOn(service.selectedTool, 'onMouseMove');
        service.getSelectedToolOnMouseMove(event);
        expect(onMouseMoveSpy).toHaveBeenCalled();
    });

    it('should call selected tool on a onMoudeDown event', () => {
        const event = {} as MouseEvent;
        const onMouseDownSpy = spyOn(service.selectedTool, 'onMouseDown');
        service.getSelectedToolOnMouseDown(event);
        expect(onMouseDownSpy).toHaveBeenCalled();
    });

    it('should call selected tool on a onMouseUp event', () => {
        const event = {} as MouseEvent;
        const onMouseUpSpy = spyOn(service.selectedTool, 'onMouseUp');
        service.getSelectedToolOnMouseUp(event);
        expect(onMouseUpSpy).toHaveBeenCalled();
    });

    it('should call selected tool on a mouseWheel event', () => {
        const event = {} as WheelEvent;
        const onMouseWheelSpy = spyOn(service.selectedTool, 'onMouseWheel');
        service.getSelectedToolOnMouseWheel(event);
        expect(onMouseWheelSpy).toHaveBeenCalled();
    });

    it('should call selected tool on a onMouseLeave event', () => {
        const onMouseLeaveSpy = spyOn(service.selectedTool, 'onMouseLeave');
        service.getSelectedToolOnMouseLeave();
        expect(onMouseLeaveSpy).toHaveBeenCalled();
    });

    it('should call selected tool on a onKeyDown event', () => {
        const event = {} as KeyboardEvent;
        const onKeyDownSpy = spyOn(service.selectedTool, 'onKeyDown');
        service.getSelectedToolOnKeyDown(event);
        expect(onKeyDownSpy).toHaveBeenCalled();
    });

    it('should call selected tool on a onKeyUp event', () => {
        const event = {} as KeyboardEvent;
        const onKeyUpSpy = spyOn(service.selectedTool, 'onKeyUp');
        service.getSelectedToolOnKeyUp(event);
        expect(onKeyUpSpy).toHaveBeenCalled();
    });
});
