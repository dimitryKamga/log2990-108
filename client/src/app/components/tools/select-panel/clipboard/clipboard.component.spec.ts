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
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { ClipboardComponent } from './clipboard.component';
import SpyObj = jasmine.SpyObj;
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure

describe('ClipboardComponent', () => {
    let component: ClipboardComponent;

    let fixture: ComponentFixture<ClipboardComponent>;
    let selectRectangleSpy: SelectRectangleService;
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
        selectRectangleSpy = new SelectRectangleService(
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
            providers: [{ provide: SelectRectangleService, usevalue: selectRectangleSpy }, ToolManagementService],
        }).compileComponents();

        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;

        selectRectangleSpy.previousSelectionBox = {
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

        selectRectangleSpy.selectionBox = {
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
        selectRectangleSpy['drawingService'].baseCtx = baseCtxStub;
        selectRectangleSpy['drawingService'].previewCtx = previewCtxStub;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClipboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewChecked should  check select-rectangle actions', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        component['selectRectangleService'].isSelected = true;
        component['selectRectangleService'].isCut = true;
        component['selectRectangleService'].movePaste = true;

        const selectRectangleServiceSpy = spyOn(component, 'handleSelectionType').and.callThrough();
        component.ngAfterViewChecked();
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });
    it('ngAfterViewChecked should  check select-rectangle actions', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;
        const selectRectangleServiceSpy = spyOn(component, 'handleSelectionType').and.callThrough();
        component.ngAfterViewChecked();
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });
    it('Copy should copy select-rectangle method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;

        const selectRectangleServiceSpy = spyOn(component['selectRectangleService'], 'copy');
        component.copy();
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });

    it('Copy should copy select-rectangle method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;

        const selectRectangleServiceSpy = spyOn(component['selectRectangleService'], 'copy');
        component.copy();
        expect(selectRectangleServiceSpy).not.toHaveBeenCalled();
    });

    it(' should cut select-rectangle method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;

        const selectRectangleServiceSpy = spyOn(component['selectRectangleService'], 'cut');
        component.cut();
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });

    it(' should cut select-rectangle method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;

        const selectRectangleServiceSpy = spyOn(component['selectRectangleService'], 'cut');
        component.cut();
        expect(selectRectangleServiceSpy).not.toHaveBeenCalled();
    });

    it(' should paste select-rectangle method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;

        const selectRectangleServiceSpy = spyOn(component['selectRectangleService'], 'paste');
        component.paste();
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });

    it(' should paste select-rectangle method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;

        const selectRectangleServiceSpy = spyOn(component['selectRectangleService'], 'paste');
        component.paste();
        expect(selectRectangleServiceSpy).not.toHaveBeenCalled();
    });
    it(' should delete select-rectangle method', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.RECTANGLE_SELECTION;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;

        const selectRectangleServiceSpy = spyOn(component['selectRectangleService'], 'delete');
        component.delete();
        expect(selectRectangleServiceSpy).toHaveBeenCalled();
    });

    it(' should delete select-rectangle method else case', () => {
        component['toolManagementService'].selectedTool.name = TOOL_LABELS.ELLIPSE;
        component['selectRectangleService'].isSelected = false;
        component['selectRectangleService'].isCut = false;
        component['selectRectangleService'].movePaste = false;

        const selectRectangleServiceSpy = spyOn(component['selectRectangleService'], 'delete');
        component.delete();
        expect(selectRectangleServiceSpy).not.toHaveBeenCalled();
    });
});
