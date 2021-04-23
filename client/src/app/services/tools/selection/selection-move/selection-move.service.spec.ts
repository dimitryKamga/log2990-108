import { inject, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionMode } from '@app/classes/enums/draw-enums';
import { Directions } from '@app/classes/enums/select-enums';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { SelectionMoveService } from './selection-move.service';
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : On voudrait acceder couvrir tous les cas de test
describe('SelectionMoveService', () => {
    let service: SelectionMoveService;
    let mouseEvent: MouseEvent;
    let keyEvent: KeyboardEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let selectionBoxCanvasTestHelper: CanvasTestHelper;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let clearImageSpy: jasmine.Spy<any>;
    let checkMousePositionSpy: jasmine.Spy<any>;
    let moveImageSpy: jasmine.Spy<any>;
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
        checkMousePositionSpy = spyOn<any>(service, 'checkMousePosition').and.callThrough();
        moveImageSpy = spyOn<any>(service, 'moveImage').and.callThrough();
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
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should ...', inject([SelectionMoveService], (selectionMoveService: SelectionMoveService) => {
        expect(selectionMoveService).toBeTruthy();
    }));
    it('onMouseDown should call checkMousePositionSpy if left button pressed and set mouseOnImage to false', () => {
        service.movePaste = true;
        service.onMouseDown({ offsetX: 0, offsetY: 0, button: 0 } as MouseEvent);
        expect(checkMousePositionSpy).toHaveBeenCalled();
        expect(service.mouseOnImage).toBe(false);
    });

    it('onMouseDown should call checkMousePositionSpy if left button pressed and set mouseOnImage to false and selection mode is LASSO', () => {
        service.movePaste = true;
        service.selectionMode = SelectionMode.LASSO;
        service.onMouseDown({ offsetX: 0, offsetY: 0, button: 0 } as MouseEvent);
        expect(checkMousePositionSpy).toHaveBeenCalled();
        expect(service.mouseOnImage).toBe(false);
    });
    it('onMouseDown should not call checkMousePositionSpy if left button not pressed ', () => {
        service.onMouseDown({ offsetX: 0, offsetY: 0, button: 1 } as MouseEvent);
        expect(checkMousePositionSpy).not.toHaveBeenCalled();
    });
    it('onMouseDown should call checkMousePositionSpy if left button pressed and set mouseOnImage to false', () => {
        service.onMouseDown({ offsetX: 11, offsetY: 0, button: 0 } as MouseEvent);
        expect(checkMousePositionSpy).toHaveBeenCalled();
        expect(service.mouseOnImage).toBe(false);
    });

    it('onMouseMove should call selectService.onMouseMove', () => {
        mouseEvent = { offsetX: 11, offsetY: 0, button: 0 } as MouseEvent;
        service.mouseOnImage = false;
        service.onMouseMove(mouseEvent);
        expect(service.mouseDownCoord).not.toBe(mouseEvent);
    });
    it('onMouseDown should call checkMousePositionSpy if left button pressed and set mouseOnImage to true', () => {
        service.onMouseDown({ offsetX: 11, offsetY: 12, button: 0 } as MouseEvent);
        expect(checkMousePositionSpy).toHaveBeenCalled();
    });
    it('onMouseMove should call moveImageSpy if left button pressed ,mouseOnImage is true and newSelection is false', () => {
        service.mouseOnImage = true;
        service.movePaste = true;
        service.newSelection = false;
        service.onMouseMove({ offsetX: 1, offsetY: 1, button: 0 } as MouseEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });

    it('onMouseMove should call moveImageSpy and lasso selection, if left button pressed ,mouseOnImage is true and newSelection is false', () => {
        service.mouseOnImage = true;
        service.movePaste = true;
        service.newSelection = false;
        service.selectionMode = SelectionMode.LASSO;
        service.onMouseMove({ offsetX: 1, offsetY: 1, button: 0 } as MouseEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onMouseMove should call clearImage if newSelection is true and resizeCounter is === 0', () => {
        service.mouseOnImage = true;
        service.newSelection = true;
        service.resizeCounter = 0;
        service.onMouseMove({ offsetX: 1, offsetY: 1, button: 0 } as MouseEvent);
        expect(clearImageSpy).toHaveBeenCalled();
    });
    it('onMouseMove should not call clearImage if newSelection is true and resizeCounter is !=0', () => {
        service.mouseOnImage = true;
        service.newSelection = true;
        service.resizeCounter = 1;
        service.onMouseMove({ offsetX: 1, offsetY: 1, button: 0 } as MouseEvent);
        expect(clearImageSpy).not.toHaveBeenCalled();
    });
    it('onMouseEnter should  set mouseOnImage to false', () => {
        service.onMouseEnter({ buttons: 0 } as MouseEvent);
        service.newSelection = false;
        expect(service.mouseOnImage).toBe(false);
    });
    it('onMouseEnter should  not set mouseOnImage to false', () => {
        mouseEvent = { buttons: 1 } as MouseEvent;
        service.mouseOnImage = true;
        service.onMouseEnter(mouseEvent);
        expect(service.mouseOnImage).toBe(true);
    });
    it('onMouseMove should call moveImageSpy if left button pressed ,mouseOnImage is true and newSelection is true', () => {
        mouseEvent = { offsetX: 1, offsetY: 1, button: 0 } as MouseEvent;
        service.mouseOnImage = true;
        service.newSelection = true;
        service.onMouseMove(mouseEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onMouseUp should set mouseOnImage to false if no button is pressed and mouseOnImage is true', () => {
        service.mouseOnImage = true;
        service.movePaste = true;
        service.isCut = true;
        service.onMouseUp({ buttons: 0 } as MouseEvent);
        expect(service.mouseOnImage).toBe(false);
    });
    it('onMouseUp should set mouseOnImage to false if no button is pressed and mouseOnImage,isCut is true, movePaste is false ', () => {
        service.mouseOnImage = true;
        service.movePaste = false;
        service.isCut = true;
        service.onMouseUp({ buttons: 0 } as MouseEvent);
        expect(service.mouseOnImage).toBe(false);
    });
    it('onMouseUp should set mouseOnImage to false if no button is pressed and mouseOnImage,isCut true and movePaste is false ', () => {
        service.mouseOnImage = true;
        service.movePaste = false;
        service.isCut = false;
        service.onMouseUp({ buttons: 0 } as MouseEvent);
        expect(service.mouseOnImage).toBe(false);
    });
    it('onMouseUp should not set mouseOnImage to false if a button is pressed ', () => {
        mouseEvent = { buttons: 1 } as MouseEvent;
        service.mouseOnImage = true;
        service.onMouseUp(mouseEvent);
        expect(service.mouseOnImage).toBe(true);
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        service.isSelected = true;
        await service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent);
        expect(service.keyDown).toBe(true);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.CENTER;
        service.isSelected = true;
        await service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.EAST;
        service.isSelected = true;
        await service.onKeyDown({ key: 'ArrowDown' } as KeyboardEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.NORTH;
        service.isSelected = true;
        await service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.NORTH_EAST;
        service.isSelected = true;
        await service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.NORTH_WEST;
        service.isSelected = true;
        await service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.SOUTH;
        service.isSelected = true;
        await service.onKeyDown({ key: 'ArrowUp' } as KeyboardEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        keyEvent = { key: 'ArrowUp' } as KeyboardEvent;
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.SOUTH_EAST;
        service.isSelected = true;
        await service.onKeyDown(keyEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        keyEvent = { key: 'ArrowUp' } as KeyboardEvent;
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.SOUTH_WEST;
        service.isSelected = true;
        await service.onKeyDown(keyEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        keyEvent = { key: 'ArrowUp' } as KeyboardEvent;
        service['magnetService'].isEnabled = true;
        service['magnetService'].anchor = Directions.WEST;
        service.isSelected = true;
        await service.onKeyDown(keyEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should call clearImage if newSelection is true and resizeCounter is ===0 ', async () => {
        keyEvent = { key: 'ArrowUp' } as KeyboardEvent;
        service.isSelected = true;
        service.newSelection = true;
        service.resizeCounter = 0;
        await service.onKeyDown(keyEvent);
        expect(clearImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should not call clearImage if newSelection is true and resizeCounter is !=0 ', async () => {
        keyEvent = { key: 'ArrowUp' } as KeyboardEvent;
        service.newSelection = true;
        service.resizeCounter = 1;
        await service.onKeyDown(keyEvent);
        expect(clearImageSpy).not.toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        keyEvent = { key: 'ArrowDown' } as KeyboardEvent;
        service.isSelected = true;
        await service.onKeyDown(keyEvent);
        expect(service.keyDown).toBe(true);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        keyEvent = { key: 'ArrowLeft' } as KeyboardEvent;
        service.isSelected = true;
        await service.onKeyDown(keyEvent);
        expect(service.keyDown).toBe(true);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should delete when pressed ', async () => {
        const deleteSpy = spyOn(service, 'delete');
        keyEvent = { key: 'Delete' } as KeyboardEvent;
        service.isSelected = true;
        await service.onKeyDown(keyEvent);
        expect(deleteSpy).toHaveBeenCalled();
    });
    it('onKeydown should  set keydown to true call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        keyEvent = { key: 'ArrowRight' } as KeyboardEvent;
        service.isSelected = true;
        await service.onKeyDown(keyEvent);
        expect(moveImageSpy).toHaveBeenCalled();
    });
    it('onKeydown should  not set keydown to true should not call waitSpy and moveImageSpy if arrowUp is pressed ', async () => {
        keyEvent = { key: 'ArrowRight' } as KeyboardEvent;
        service.isSelected = false;
        await service.onKeyDown(keyEvent);
        expect(moveImageSpy).not.toHaveBeenCalled();
    });
});
