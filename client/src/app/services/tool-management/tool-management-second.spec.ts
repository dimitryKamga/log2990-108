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
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { SelectService } from '@app/services/tools/selection/select/select.service';
import { EllipseService } from '@app/services/tools/shape/ellipse/ellipse.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/shape/rectangle/rectangle.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';

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
    let selectRectangleSpy: SelectRectangleService;
    let selectEllipseSpy: SelectEllipseService;
    let selectionServiceSpy: SpyObj<SelectService>;
    let selectLassoSpy: SelectLassoService;

    let undoRedoServiceSpy: UndoRedoService;
    let baseCtxStub: CanvasRenderingContext2D;
    let baseCtxxStub: CanvasRenderingContext2D;
    let previewCtxxStub: CanvasRenderingContext2D;
    let canvasTestHelper: HTMLCanvasElement;

    beforeEach(() => {
        shortcutsHandlerServiceSpy = jasmine.createSpyObj('ShortcutsHandlerService', ['getShortcut']);
        shortcutsHandlerServiceSpy.getShortcut.and.returnValue(obs.asObservable());
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['openWarning', 'clearCanvas', 'getIsToolInUse', 'canvas', 'baseCtx']);
        modalServiceServiceSpy = jasmine.createSpyObj('ModalService', ['newDrawing', 'openExportModal', 'openSavingModal', 'openCarrouselModal']);
        selectionServiceSpy = jasmine.createSpyObj('SelectService', ['selectAll']);
        gridServiceSpy = jasmine.createSpyObj('GridService', ['setGridEnabler']);
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
        selectLassoSpy = new SelectLassoService(
            drawingServiceSpy,
            {} as ColorService,
            {} as UndoRedoPilesService,
            {} as GridService,
            {} as MagnetService,
            {} as LineService,
            {} as GeneralFunctionsService,
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
                { provide: SelectRectangleService, useValue: selectRectangleSpy },
                { provide: SelectEllipseService, useValue: selectEllipseSpy },
                { provide: SelectLassoService, useValue: selectLassoSpy },
                { provide: EraserService, useValue: new Mock(TOOL_LABELS.ERASER) },
                { provide: MatSnackBar, useValue: {} },
                { provide: HttpClientModule, useValue: {} },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
                { provide: GridService, useValue: gridServiceSpy },
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

    it('should select feature saving', () => {
        service['selectedFeature'](FEATURES_SIDEBAR.SAVE_LABEL);
        expect(modalServiceServiceSpy.openSavingModal).toHaveBeenCalled();
    });

    it('should switch actions when selectEllipse and copy', () => {
        service.selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        service['selectEllipseService'].isSelected = true;
        const selectEllipseServiceSpy = spyOn(service['selectEllipseService'], 'copy');
        service['switchSelectActions'](FEATURES_SIDEBAR.COPY);
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectRectangle and copy', () => {
        service.selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        service['selectRectangleService'].isSelected = true;
        const selectRectangleServiceSpy = spyOn(service['selectRectangleService'], 'copy');
        service['switchSelectActions'](FEATURES_SIDEBAR.COPY);
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectLasso and copy', () => {
        service.selectedTool.name = TOOL_LABELS.LASSO;
        service['selectLassoService'].isSelected = true;
        const selecLassoServiceSpy = spyOn(service['selectLassoService'], 'copy');
        service['switchSelectActions'](FEATURES_SIDEBAR.COPY);
        expect(selecLassoServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectEllipse and paste', () => {
        service.selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;

        service['selectEllipseService'].canPaste = true;
        const selectEllipseServiceSpy = spyOn(service['selectEllipseService'], 'paste');
        service['switchSelectActions'](FEATURES_SIDEBAR.PASTE);
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectRectangle and paste', () => {
        service.selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;

        service['selectRectangleService'].canPaste = true;
        const selectRectangleServiceSpy = spyOn(service['selectRectangleService'], 'paste');
        service['switchSelectActions'](FEATURES_SIDEBAR.PASTE);
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectLasso and paste', () => {
        service.selectedTool.name = TOOL_LABELS.LASSO;
        service['selectLassoService'].canPaste = true;
        const selecLassoServiceSpy = spyOn(service['selectLassoService'], 'paste');
        service['switchSelectActions'](FEATURES_SIDEBAR.PASTE);
        expect(selecLassoServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectEllipse and cut', () => {
        service.selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        service['selectEllipseService'].isSelected = true;
        const selectEllipseServiceSpy = spyOn(service['selectEllipseService'], 'cut');
        service['switchSelectActions'](FEATURES_SIDEBAR.CUT);
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectRectangle and cut', () => {
        service.selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        service['selectRectangleService'].isSelected = true;
        const selectRectangleServiceSpy = spyOn(service['selectRectangleService'], 'cut');
        service['switchSelectActions'](FEATURES_SIDEBAR.CUT);
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectLasso and cut', () => {
        service.selectedTool.name = TOOL_LABELS.LASSO;
        service['selectLassoService'].isSelected = true;
        const selecLassoServiceSpy = spyOn(service['selectLassoService'], 'cut');
        service['switchSelectActions'](FEATURES_SIDEBAR.CUT);
        expect(selecLassoServiceSpy).toHaveBeenCalled();
    });

    it('should switch actions when selectEllipse and cut and isSelected false', () => {
        service.selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        service['selectEllipseService'].isSelected = false;
        const selectEllipseServiceSpy = spyOn(service['selectEllipseService'], 'cut');
        service['switchSelectActions'](FEATURES_SIDEBAR.CUT);
        expect(selectEllipseServiceSpy).not.toHaveBeenCalled();
    });

    it('should switch actions when selectRectangle and cut', () => {
        service.selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        service['selectRectangleService'].isSelected = false;
        const selectRectangleServiceSpy = spyOn(service['selectRectangleService'], 'cut');
        service['switchSelectActions'](FEATURES_SIDEBAR.CUT);
        expect(selectRectangleServiceSpy).not.toHaveBeenCalled();
    });

    it('should verify copy state when isSeelected false', () => {
        service.selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        service['selectRectangleService'].isSelected = false;
        const selectRectangleServiceSpy = spyOn(service['selectRectangleService'], 'cut');
        service['verifyCopyState'](selectRectangleSpy);
        expect(selectRectangleServiceSpy).not.toHaveBeenCalled();
    });
    it('should verify paste state when isSeelected false', () => {
        service.selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        service['selectRectangleService'].isSelected = false;
        const selectRectangleServiceSpy = spyOn(service['selectRectangleService'], 'paste');
        service['verifyPasteState'](selectRectangleSpy);
        expect(selectRectangleServiceSpy).not.toHaveBeenCalled();
    });
    it('should reset tools selection Lasso when another tool is selected', () => {
        const spy = spyOn<any>(service, 'resetSelection').and.callThrough();
        selectLassoSpy.isSelected = true;
        service.selectedTool = selectLassoSpy;
        service['resetTools']('lasso');
        expect(spy).toHaveBeenCalled();
    });
});
