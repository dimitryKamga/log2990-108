import { inject, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SelectionMode } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { SelectionMoveService } from './selection-move.service';
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : On voudrait acceder couvrir tous les cas de test
describe('SelectionMoveService', () => {
    let service: SelectionMoveService;

    let keyEvent: KeyboardEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let selectionBoxCanvasTestHelper: CanvasTestHelper;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let clearImageSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        undoRedoPilesSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool', 'handlePiles']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPilesSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        selectionBoxCanvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SelectionMoveService);
        clearImageSpy = spyOn<any>(service, 'clearImage').and.callThrough();
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.controlPoints = {
            topLeft: { x: 10, y: 10 },
            top: { x: 5, y: 0 },
            topRight: { x: 10, y: 0 },
            right: { x: 10, y: 5 },
            bottomRight: { x: 10, y: 10 },
            bottom: { x: 5, y: 10 },
            bottomLeft: { x: 0, y: 10 },
            left: { x: 0, y: 5 },
        };
        service.previousSelectionBox = {
            image: new ImageData(5, 5),
            width: 5,
            height: 5,
            mainColor: '',
            secondaryColor: '',
            name: '',
            thickness: 1,
            topLeft: { x: 10, y: 10 },
            initialPoint: { x: 10, y: 10 },
            imageCanvas: canvasTestHelper.canvas,
            imageContexte: canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D,
        };

        service.previousLassoBox = {
            name: SelectionMode.LASSO,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            topLeft: { x: 0, y: 0 },
            initialPoint: { x: 0, y: 0 },
            imageCanvas: new CanvasTestHelper().canvas,
            imageContexte: new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D,
        };
        service.selectionBox = {
            image: new ImageData(5, 5),
            width: 5,
            height: 5,
            mainColor: '',
            secondaryColor: '',
            name: '',
            thickness: 1,
            topLeft: { x: 10, y: 10 },
            initialPoint: { x: 10, y: 10 },
            imageCanvas: selectionBoxCanvasTestHelper.canvas,
            imageContexte: selectionBoxCanvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D,
        };

        service.lassoAttributes = {
            name: TOOL_LABELS.LASSO,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [
                { x: 1, y: 1 },
                { x: 1, y: 5 },
                { x: 2, y: 2 },
                { x: 3, y: 3 },
            ],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [{ firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } }],
            dotRadius: 1,
        };
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should ...', inject([SelectionMoveService], (selectionMoveService: SelectionMoveService) => {
        expect(selectionMoveService).toBeTruthy();
    }));

    it('onKeyUp should  set keydown to false if keydown is true and the keyEvent is not repeated', () => {
        keyEvent = { repeat: false } as KeyboardEvent;
        service.keyDown = true;
        service.onKeyUp(keyEvent);
        expect(service.keyDown).toBe(false);
    });
    it('onKeydown should  call to true should not call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        keyEvent = { key: 'ArrowRight' } as KeyboardEvent;
        const keyboardEventSpy = jasmine.createSpyObj('KeyboardEvent', ['stopPropagation']);
        keyboardEventSpy.code = 'ArrowRight';
        await service.onKeyDown(keyboardEventSpy);
        expect(keyboardEventSpy.stopPropagation).toHaveBeenCalled();
    });
    it('onKeyUp should  not set keydown to false if keydown is already false', () => {
        service.keyDown = false;
        keyEvent = { repeat: true } as KeyboardEvent;
        service.onKeyUp(keyEvent);
        expect(service.keyDown).toBe(false);
    });
    it('drawSelectedImage should call ctx.drawImage', () => {
        const drawImageSpy = spyOn(previewCtxStub, 'drawImage').and.callThrough();
        service.drawSelectedImage(previewCtxStub, service.selectionBox);
        expect(drawImageSpy).toHaveBeenCalled();
    });
    it('should copy selection', () => {
        service.isCut = true;
        service.copy();
        expect(service.canPaste).toBeTrue();
    });

    it('should copy selection when mode is lasso', () => {
        service.isCut = true;
        service.selectionMode = SelectionMode.LASSO;
        service.copy();
        expect(service.canPaste).toBeTrue();
    });

    it('should cut selection when isCut is True and mode is lasso', () => {
        service.selectionMode = SelectionMode.LASSO;
        service.isCut = true;
        service.cut();
        expect(service.canPaste).toBeTrue();
        expect(clearImageSpy).toHaveBeenCalled();
    });

    it('should paste selection when isCut is False', () => {
        service.selectionMode = SelectionMode.LASSO;
        const drawSelectionSpy = spyOn<any>(service, 'drawSelection');
        const setControlSpy = spyOn<any>(service, 'setControlPoints');
        service.isCut = false;
        service.movePaste = true;
        service.paste();
        expect(drawSelectionSpy).toHaveBeenCalled();
        expect(setControlSpy).toHaveBeenCalled();
    });
    it('should paste selection when isCut is False', () => {
        const drawSelectionSpy = spyOn<any>(service, 'drawSelection');
        const setControlSpy = spyOn<any>(service, 'setControlPoints');
        service.isCut = false;
        service.movePaste = true;
        service.paste();
        expect(drawSelectionSpy).toHaveBeenCalled();
        expect(setControlSpy).toHaveBeenCalled();
    });
    it('should cut selection when isCut is True', () => {
        service.isCut = true;
        service.cut();
        expect(clearImageSpy).toHaveBeenCalled();
    });
    it('should delete selection when isCut is True', () => {
        service.delete();
        expect(service.canDelete).toBeFalse();
        expect(clearImageSpy).toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });
});
