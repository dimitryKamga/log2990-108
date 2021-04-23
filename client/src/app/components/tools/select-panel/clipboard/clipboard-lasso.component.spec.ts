import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';
import { MagnetService } from '@app/services/magnet/magnet.service';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';
import { LineService } from '@app/services/tools/line/line.service';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { ClipboardComponent } from './clipboard.component';

import SpyObj = jasmine.SpyObj;
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure

describe('ClipboardComponent', () => {
    let component: ClipboardComponent;

    let fixture: ComponentFixture<ClipboardComponent>;
    let selectLassoSpy: SelectLassoService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let drawingServiceSpy: SpyObj<DrawingService>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'openWarning',
            'clearCanvas',
            'getIsToolInUse',
            'canvas',
            'baseCtx',
            'drawImage',
        ]);
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
            imports: [MatDialogModule, MatSnackBarModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ClipboardComponent],
            providers: [{ provide: SelectLassoService, useValue: selectLassoSpy }, ToolManagementService],
        }).compileComponents();

        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;

        selectLassoSpy.previousSelectionBox = {
            image: new ImageData(5, 5),
            width: 5,
            height: 5,
            mainColor: '',
            secondaryColor: '',
            name: '',
            thickness: 1,
            topLeft: { x: 10, y: 10 },
            initialPoint: { x: 10, y: 10 },
            imageCanvas: new CanvasTestHelper().canvas,
            imageContexte: new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D,
        };

        selectLassoSpy.selectionBox = {
            image: new ImageData(5, 5),
            width: 5,
            height: 5,
            mainColor: '',
            secondaryColor: '',
            name: '',
            thickness: 1,
            topLeft: { x: 10, y: 10 },
            initialPoint: { x: 10, y: 10 },
            imageCanvas: new CanvasTestHelper().canvas,
            imageContexte: new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D,
        };
        selectLassoSpy['drawingService'].baseCtx = baseCtxStub;
        selectLassoSpy['drawingService'].previewCtx = previewCtxStub;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClipboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewChecked should check select-lasso actions', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.LASSO;
        component['selectLassoService'].isSelected = true;
        component['selectLassoService'].isCut = true;
        component['selectLassoService'].movePaste = true;

        const selectLassoServiceSpy = spyOn(component, 'handleSelectionType').and.callThrough();
        component.ngAfterViewChecked();
        expect(selectLassoServiceSpy).toHaveBeenCalled();
    });
    it('ngAfterViewChecked should check select-lasso actions', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.LASSO;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component, 'handleSelectionType').and.callThrough();
        component.ngAfterViewChecked();
        expect(selectLassoServiceSpy).toHaveBeenCalled();
    });

    it('Copy should copy select-lasso method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.LASSO;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component['selectLassoService'], 'copy');
        component.copy();
        expect(selectLassoServiceSpy).toHaveBeenCalled();
    });
    it('Copy should copy select-lasso method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component['selectLassoService'], 'copy');
        component.copy();
        expect(selectLassoServiceSpy).not.toHaveBeenCalled();
    });

    it(' should cut select-lasso method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.LASSO;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component['selectLassoService'], 'cut');
        component.cut();
        expect(selectLassoServiceSpy).toHaveBeenCalled();
    });
    it('Copy should cut select-lasso method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component['selectLassoService'], 'cut');
        component.cut();
        expect(selectLassoServiceSpy).not.toHaveBeenCalled();
    });

    it(' should paste select-lasso method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.LASSO;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component['selectLassoService'], 'paste');
        component.paste();
        expect(selectLassoServiceSpy).toHaveBeenCalled();
    });
    it('Copy should paste select-lasso method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component['selectLassoService'], 'paste');
        component.paste();
        expect(selectLassoServiceSpy).not.toHaveBeenCalled();
    });
    it(' should delete select-lasso method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.LASSO;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component['selectLassoService'], 'delete');
        component.delete();
        expect(selectLassoServiceSpy).toHaveBeenCalled();
    });
    it('Copy should delete select-lasso method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE;
        component['selectLassoService'].isSelected = false;
        component['selectLassoService'].isCut = false;
        component['selectLassoService'].movePaste = false;

        const selectLassoServiceSpy = spyOn(component['selectLassoService'], 'delete');
        component.delete();
        expect(selectLassoServiceSpy).not.toHaveBeenCalled();
    });
});
