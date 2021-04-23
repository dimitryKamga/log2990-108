// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : On voudrait acceder couvrir tous les cas de test
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ControlPointId } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { SelectionResizeService } from './selection-resize.service';
describe('SelectionResizeService', () => {
    let service: SelectionResizeService;
    let mouseEvent: MouseEvent;
    let keyEvent: KeyboardEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let serviceCanvasTestHelper: CanvasTestHelper;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let tempCtxStub: CanvasRenderingContext2D;
    let getControlPointIdSpy: jasmine.Spy<any>;
    let clearImageSpy: jasmine.Spy<any>;
    let getResizerStyleSpy: jasmine.Spy<any>;
    let resizeSelectionSpy: jasmine.Spy<any>;
    let resizeSpy: jasmine.Spy<any>;
    let drawResizedSelectionSpy: jasmine.Spy<any>;
    let checkControlPointSpy: jasmine.Spy<any>;
    let mirrorimageSpy: jasmine.Spy<any>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
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
        serviceCanvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCtxStub = serviceCanvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SelectionResizeService);
        getControlPointIdSpy = spyOn<any>(service, 'getControlPointId').and.callThrough();
        clearImageSpy = spyOn<any>(service, 'clearImage').and.callThrough();
        getResizerStyleSpy = spyOn<any>(service, 'getResizerStyle').and.callThrough();
        resizeSelectionSpy = spyOn<any>(service, 'resizeSelection').and.callThrough();
        resizeSpy = spyOn<any>(service, 'resize').and.callThrough();
        drawResizedSelectionSpy = spyOn<any>(service, 'drawResizedSelection').and.callThrough();
        checkControlPointSpy = spyOn<any>(service, 'checkControlPoint').and.callThrough();
        mirrorimageSpy = spyOn<any>(service, 'mirrorimage').and.callThrough();
        service['drawingService'].baseCtx = baseCtxStub;
        service.tempCtx = tempCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.controlPoints = {
            topLeft: { x: 10, y: 10 },
            top: { x: 20, y: 10 },
            topRight: { x: 30, y: 10 },
            right: { x: 30, y: 20 },
            bottomRight: { x: 30, y: 30 },
            bottom: { x: 20, y: 30 },
            bottomLeft: { x: 10, y: 30 },
            left: { x: 10, y: 20 },
        };
        service.shiftDown = true;
        service.initialPoint = { x: 2, y: 2 };
        service.finalPoint = { x: 3, y: 4 };
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
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('getControlPointId should set service.controlPointId to 0 if its superior to zero', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 2;
        service['getControlPointId'](service.controlPoints, point, false);
        expect(service.controlPointId).toBe(0);
        expect(checkControlPointSpy).toHaveBeenCalled();
    });
    it('checkCornerPoints should set service.initialPoint', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 3;
        service['checkCornerPoints'](point);
        expect(service.initialPoint).toEqual(point);
    });
    it('checkCornerPoints should set service.finallPoint', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 7;
        service['checkCornerPoints'](point);
        expect(service.finalPoint).toEqual(point);
    });
    it('checkCornerPoints should set service.finalPoint.x and service.initialPoint.y', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 5;
        service['checkCornerPoints'](point);
        expect(service.finalPoint.x).toEqual(point.x);
        expect(service.initialPoint.y).toEqual(point.y);
    });
    it('checkCornerPoints should set service.finalPoint.y and service.initialPoint.x', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 1;
        service['checkCornerPoints'](point);
        expect(service.finalPoint.y).toEqual(point.y);
        expect(service.initialPoint.x).toEqual(point.x);
    });
    it('checkSidePoints should set  service.initialPoint.y', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 4;
        service['checkSidePoints'](point);
        expect(service.initialPoint.y).toEqual(point.y);
    });
    it('checkSidePoints should set  service.finallPoint.y', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 8;
        service['checkSidePoints'](point);
        expect(service.finalPoint.y).toEqual(point.y);
    });
    it('checkSidePoints should set  service.finalPoint.x', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 6;
        service['checkSidePoints'](point);
        expect(service.finalPoint.x).toEqual(point.x);
    });
    it('checkSidePoints should set  service.initialPoint.x', () => {
        const point = { x: 10, y: 10 };
        service.controlPointId = 2;
        service['checkSidePoints'](point);
        expect(service.initialPoint.x).toEqual(point.x);
    });
    it('resizeImage should call drawImage and restore', () => {
        const drawImageSpy = spyOn(service.tempCtx, 'drawImage').and.callThrough();
        service.resizeRatio = { x: -1, y: -1 };
        service['resizeImage'](service.selectionBox);
        expect(drawImageSpy).toHaveBeenCalled();
    });
    it('onMouseDown should set service.controlPointId to ControlPointId.TOP_LEFT', () => {
        service.controlPointId = 0;
        mouseEvent = { offsetX: 10, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(service.controlPointId).toEqual(ControlPointId.TOP_LEFT);
        expect(getControlPointIdSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
        expect(resizeSpy).toHaveBeenCalled();
        expect(drawResizedSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should set service.controlPoinId to 0', () => {
        mouseEvent = { offsetX: 12, offsetY: 0, button: 0 } as MouseEvent;
        service.resizeCounter = 1;
        service.onMouseDown(mouseEvent);
        expect(service.controlPointId).toEqual(0);
    });
    it('onMouseDown should call clearImage', () => {
        service.resizeCounter = 0;
        mouseEvent = { offsetX: 10, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(clearImageSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.topleft', () => {
        service.movePaste = true;
        mouseEvent = { offsetX: 10, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.top', () => {
        mouseEvent = { offsetX: 20, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.topRight', () => {
        service.isCut = true;
        mouseEvent = { offsetX: 30, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.left', () => {
        mouseEvent = { offsetX: 10, offsetY: 20, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.right', () => {
        mouseEvent = { offsetX: 30, offsetY: 20, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.bottomleft', () => {
        mouseEvent = { offsetX: 10, offsetY: 30, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.bottom', () => {
        mouseEvent = { offsetX: 20, offsetY: 30, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.bottomright', () => {
        mouseEvent = { offsetX: 30, offsetY: 30, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call getResizerStyleSpy if mouse on controlPoint.bottomright', () => {
        service.shiftDown = false;
        mouseEvent = { offsetX: 30, offsetY: 30, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(getResizerStyleSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseMove should call resizeSelection, resize and drawResizedSelection', () => {
        mouseEvent = { offsetX: 30, offsetY: 30, button: 0 } as MouseEvent;
        service.controlPointId = 2;
        service.onMouseMove(mouseEvent);
        expect(resizeSelectionSpy).toHaveBeenCalled();
        expect(resizeSpy).toHaveBeenCalled();
        expect(drawResizedSelectionSpy).toHaveBeenCalled();
    });
    it('onMouseMove should call getControlPointId and getResizerStyle', () => {
        mouseEvent = { offsetX: 0, offsetY: 3, button: 0 } as MouseEvent;
        service.controlPointId = 0;
        service.onMouseMove(mouseEvent);
        expect(getControlPointIdSpy).toHaveBeenCalled();
        expect(getResizerStyleSpy).toHaveBeenCalled();
    });
    it('onMouseLeave should call setControlPoint and mirrorImage ', () => {
        service.controlPointId = 3;
        service.resizeRatio.x = -2;
        service.onMouseLeave();
        expect(service.controlPointId).toBe(0);
        expect(mirrorimageSpy).toHaveBeenCalled();
    });
    it('onMouseLeave should not call  mirrorImage ', () => {
        service.controlPointId = 3;
        service.resizeRatio = { x: 1, y: 1 };
        service.onMouseLeave();
        expect(mirrorimageSpy).not.toHaveBeenCalled();
    });
    it('onMouseLeave should not call  mirrorImage ', () => {
        service.controlPointId = 0;
        service.onMouseLeave();
        expect(mirrorimageSpy).not.toHaveBeenCalled();
    });
    it('onMouseLeave should call setControlPoint and mirrorImage if controlPoinTId = 0', () => {
        service.controlPointId = 3;
        service.resizeRatio.y = -2;
        service.onMouseLeave();
        expect(service.controlPointId).toBe(0);
        expect(mirrorimageSpy).toHaveBeenCalled();
    });
    it('onMouseUp should call mirrorImage set controlpointId to 0 and shiftdown to false', () => {
        mouseEvent = { offsetX: 30, offsetY: 30, button: 0 } as MouseEvent;
        service.resizeCounter = 1;
        service.controlPointId = 3;
        service.resizeRatio = { x: -2, y: 2 };
        service.onMouseUp(mouseEvent);
        expect(service.controlPointId).toBe(0);
        expect(mirrorimageSpy).toHaveBeenCalled();
        expect(service.shiftDown).toBe(false);
        expect(service.resizeCounter).toBe(2);
    });
    it('onMouseUp should call mirrorImage set controlpointId to 0 and shiftdown to false', () => {
        mouseEvent = { offsetX: 30, offsetY: 30, button: 0 } as MouseEvent;
        service.controlPointId = 3;
        service.resizeRatio = { x: 1, y: 1 };
        service.onMouseUp(mouseEvent);
        expect(service.controlPointId).toBe(0);
        expect(service.shiftDown).toBe(false);
    });
    it('onMouseUp should not set mouseDownCoord', () => {
        const point = { x: 30, y: 30 };
        mouseEvent = { offsetX: 30, offsetY: 30, button: 0 } as MouseEvent;
        service.controlPointId = 0;
        service.onMouseUp(mouseEvent);
        expect(service.mouseDownCoord).not.toBe(point);
    });
    it('onKeyDown should call resize, resizeSelection and drawResizedSelection ', async () => {
        service.controlPointId = 8;
        service.mouseDownCoord = { x: 1, y: 1 };
        keyEvent = { shiftKey: true } as KeyboardEvent;
        await service.onKeyDown(keyEvent);
        expect(service.shiftDown).toBe(true);
        expect(resizeSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
        expect(drawResizedSelectionSpy).toHaveBeenCalled();
    });
    it('onKeyDown should not call resize, resizeSelection and drawResizedSelection ', async () => {
        service.controlPointId = 0;
        service.shiftDown = false;
        service.mouseDownCoord = { x: 1, y: 1 };
        keyEvent = { shiftKey: true } as KeyboardEvent;
        await service.onKeyDown(keyEvent);
        expect(service.shiftDown).toBe(false);
        expect(resizeSpy).not.toHaveBeenCalled();
    });
    it('onKeyUp should  call resize, resizeSelection and drawResizedSelection ', () => {
        service.controlPointId = 2;
        service.mouseDownCoord = { x: 1, y: 1 };
        service.resizeRatio = { x: 0, y: 0 };
        keyEvent = { shiftKey: false } as KeyboardEvent;
        service.onKeyUp(keyEvent);
        expect(service.shiftDown).toBe(false);
        expect(resizeSpy).toHaveBeenCalled();
        expect(resizeSelectionSpy).toHaveBeenCalled();
        expect(drawResizedSelectionSpy).toHaveBeenCalled();
    });
    it('onKeyUp should not call resize, resizeSelection and drawResizedSelection ', () => {
        service.controlPointId = 0;
        service.resizeRatio = { x: 1, y: -2 };
        service.mouseDownCoord = { x: 1, y: 1 };
        keyEvent = { shiftKey: false } as KeyboardEvent;
        service.onKeyUp(keyEvent);
        expect(service.shiftDown).toBe(true);
        expect(resizeSpy).not.toHaveBeenCalled();
        expect(resizeSelectionSpy).not.toHaveBeenCalled();
    });
    it('onMouseDown should not set mouseDownCoord if left button not pressed', () => {
        mouseEvent = { offsetX: 1, offsetY: 1, button: 1 } as MouseEvent;
        const point = { x: 1, y: 1 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).not.toBe(point);
    });
    it('updateSelection should call ctx.drawImage, drawServiceSpy.clearCanvas ', () => {
        const putImageDataSpy = spyOn(previewCtxStub, 'putImageData').and.callThrough();
        service.updateSelection(previewCtxStub, service.selectionBox);
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
});
