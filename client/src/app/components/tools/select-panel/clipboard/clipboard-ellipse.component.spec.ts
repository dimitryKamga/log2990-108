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
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { ClipboardComponent } from './clipboard.component';

import SpyObj = jasmine.SpyObj;
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure

describe('ClipboardComponent', () => {
    let component: ClipboardComponent;

    let fixture: ComponentFixture<ClipboardComponent>;
    let selectEllipseSpy: SelectEllipseService;
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
        selectEllipseSpy = new SelectEllipseService(
            drawingServiceSpy,
            {} as ColorService,
            {} as UndoRedoPilesService,
            {} as MagnetService,
            {} as GeneralFunctionsService,
            {} as GridService,
        );

        TestBed.configureTestingModule({
            imports: [MatDialogModule, MatSnackBarModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ClipboardComponent],
            providers: [{ provide: SelectEllipseService, useValue: selectEllipseSpy }, ToolManagementService],
        }).compileComponents();

        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;

        selectEllipseSpy.previousSelectionBox = {
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

        selectEllipseSpy.selectionBox = {
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
        selectEllipseSpy['drawingService'].baseCtx = baseCtxStub;
        selectEllipseSpy['drawingService'].previewCtx = previewCtxStub;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClipboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewChecked should check select-ellipse actions', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        component['selectEllipseService'].isSelected = true;
        component['selectEllipseService'].isCut = true;
        component['selectEllipseService'].movePaste = true;

        const selectEllipseServiceSpy = spyOn(component, 'handleSelectionType').and.callThrough();
        component.ngAfterViewChecked();
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });
    it('ngAfterViewChecked should check select-ellipse actions', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component, 'handleSelectionType').and.callThrough();
        component.ngAfterViewChecked();
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });

    it('Copy should copy select-ellipse method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component['selectEllipseService'], 'copy');
        component.copy();
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });
    it('Copy should copy select-ellipse method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component['selectEllipseService'], 'copy');
        component.copy();
        expect(selectEllipseServiceSpy).not.toHaveBeenCalled();
    });

    it(' should cut select-ellipse method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component['selectEllipseService'], 'cut');
        component.cut();
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });
    it('Copy should cut select-ellipse method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component['selectEllipseService'], 'cut');
        component.cut();
        expect(selectEllipseServiceSpy).not.toHaveBeenCalled();
    });

    it(' should paste select-ellipse method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component['selectEllipseService'], 'paste');
        component.paste();
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });
    it('Copy should paste select-ellipse method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component['selectEllipseService'], 'paste');
        component.paste();
        expect(selectEllipseServiceSpy).not.toHaveBeenCalled();
    });
    it(' should delete select-ellipse method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE_SELECTION;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component['selectEllipseService'], 'delete');
        component.delete();
        expect(selectEllipseServiceSpy).toHaveBeenCalled();
    });
    it('Copy should delete select-ellipse method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE;
        component['selectEllipseService'].isSelected = false;
        component['selectEllipseService'].isCut = false;
        component['selectEllipseService'].movePaste = false;

        const selectEllipseServiceSpy = spyOn(component['selectEllipseService'], 'delete');
        component.delete();
        expect(selectEllipseServiceSpy).not.toHaveBeenCalled();
    });
});
