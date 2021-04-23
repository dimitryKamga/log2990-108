// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { LassoUndoAttributes } from '@app/classes/interfaces/tools-attributes';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { SelectService } from '@app/services/tools/selection/select/select.service';

describe('SelectLassoService', () => {
    let service: SelectLassoService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let selectServiceSpy: jasmine.SpyObj<SelectService>;
    let selectionBoxCanvasTestHelper: CanvasTestHelper;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let tempsCanvas: HTMLCanvasElement;

    let findBoxDimensionsSpy: jasmine.Spy<any>;
    let setLassoImageSpy: jasmine.Spy<any>;
    let removeLassoImageSpy: jasmine.Spy<any>;
    let enableSelectionSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['baseCtx', 'clearCanvas', 'previewCtx']);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', [
            'beginPath',
            'stroke',
            'ellipse',
            'rect',
            'getImageData',
            'fill',
            'fillRect',
            'createImageData',
            'drawImage',
            'moveTo',
            'lineTo',
            'closePath',
            'save',
            'clip',
            'restore',
            'setLineDash',
        ]);
        selectServiceSpy = jasmine.createSpyObj('SelectService', ['drawSelectionBox', 'getSelectedImage']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: SelectService, useValue: selectServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        tempsCanvas = document.createElement('canvas');
        selectionBoxCanvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SelectLassoService);
        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].baseCtx = baseCtxStub;
        const ten = 10;
        tempsCanvas.width = ten;
        tempsCanvas.height = ten;
        service['drawingService'].canvas = tempsCanvas;
        findBoxDimensionsSpy = spyOn<any>(service, 'findBoxDimensions').and.callThrough();
        setLassoImageSpy = spyOn<any>(service, 'setLassoImage').and.callThrough();
        enableSelectionSpy = spyOn<any>(service, 'enableSelection').and.callThrough();
        removeLassoImageSpy = spyOn<any>(service, 'removeLassoImage').and.callThrough();
        service.selectionBox = {
            image: new ImageData(5, 5),
            width: 10,
            height: 10,
            mainColor: '',
            secondaryColor: '',
            name: '',
            thickness: 1,
            topLeft: { x: 10, y: 10 },
            initialPoint: { x: 10, y: 10 },
            imageCanvas: selectionBoxCanvasTestHelper.canvas,
            imageContexte: selectionBoxCanvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D,
        };
        service.controlPoints = {
            topLeft: { x: 0, y: 0 },
            top: { x: 5, y: 0 },
            topRight: { x: 10, y: 0 },
            right: { x: 10, y: 5 },
            bottomRight: { x: 10, y: 10 },
            bottom: { x: 5, y: 10 },
            bottomLeft: { x: 0, y: 10 },
            left: { x: 0, y: 5 },
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
    it('should find box dimension', () => {
        const points = [{ x: 12, y: 13 }];
        const finalPoint = { x: 12, y: 13 };
        service['findBoxDimensions'](points);
        expect(service.finalPoint.x).toEqual(finalPoint.x);
    });
    it('should find box dimension', () => {
        const points = [{ x: -30, y: -30 }];
        const finalPoint = { x: 0, y: 0 };
        service['findBoxDimensions'](points);
        expect(service.finalPoint.x).toEqual(finalPoint.x);
    });
    it('should find box dimension', () => {
        const canvasSize = 0;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasSize;
        tempCanvas.height = canvasSize;
        service['drawingService'].canvas = tempCanvas;
        const points = [{ x: 0, y: 0 }];
        const finalPoint = { x: 0, y: 0 };
        service['findBoxDimensions'](points);
        expect(service.finalPoint.x).toEqual(finalPoint.x);
    });
    it('should find box dimension', () => {
        const canvasSize = 100;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasSize;
        tempCanvas.height = canvasSize;
        service['drawingService'].canvas = tempCanvas;
        const points = [
            { x: 1, y: 1 },
            { x: 1, y: 5 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        const finalPoint = { x: 3, y: 5 };
        service['findBoxDimensions'](points);
        expect(service.finalPoint.x).toEqual(finalPoint.x);
    });
    it('should enable selection', () => {
        service.lassoAttributes.mouseClicks = [
            { x: 1, y: 1 },
            { x: 1, y: 5 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        service.lassoAttributes.isDoubleClicked = true;
        service['enableSelection']();
        expect(findBoxDimensionsSpy).toHaveBeenCalled();
    });
    it('should enable selection', () => {
        service.lassoAttributes.isDoubleClicked = false;
        service['enableSelection']();
        expect(findBoxDimensionsSpy).not.toHaveBeenCalled();
    });
    it('should findBorders', () => {
        service['findBorder']();
        expect(setLassoImageSpy).toHaveBeenCalled();
    });
    it('should checkIsLastPoint', () => {
        service.lassoAttributes.isLastPoint = false;
        service['checkIsLastPoint']();
        expect(service.lassoAttributes.isDoubleClicked).toBeTruthy();
    });
    it('should checkIsLastPoint', () => {
        service.lassoAttributes.isLastPoint = true;
        service['checkIsLastPoint']();
        expect(enableSelectionSpy).toHaveBeenCalled();
    });
    it('should cancelSelection', () => {
        service['cancelSelection']();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    it('should setLassoImage', () => {
        service['setLassoImage'](previewCtxSpy);
        expect(previewCtxSpy.drawImage).toHaveBeenCalled();
    });
    it('should clearImage', () => {
        service['clearImage'](previewCtxSpy, service.selectionBox);
        expect(previewCtxSpy.clip).not.toHaveBeenCalled();
    });
    it('should clearImage', () => {
        service.lassoAttributes.isLastPoint = true;
        service['clearImage'](previewCtxSpy, service.selectionBox);
        expect(previewCtxSpy.clip).toHaveBeenCalled();
    });
    it('should set lineservice.isDrawing drawing to true', async () => {
        service.isSelected = false;
        const key = { key: 'Escape' } as KeyboardEvent;
        await service.onKeyDown(key);
        expect(service['lineService'].isDrawing).toBeFalsy();
    });
    it('should set lineservice.isShiftActive drawing to true', async () => {
        service.isSelected = false;
        const key = { key: 'Shift' } as KeyboardEvent;
        await service.onKeyDown(key);
        expect(service['lineService'].isShiftActive).toBeTruthy();
    });
    it('should set not lineservice.isShiftActive drawing to true', async () => {
        service.isSelected = true;
        const key = { key: 'ArrowUp' } as KeyboardEvent;
        await service.onKeyDown(key);
        expect(service['lineService'].isShiftActive).toBeFalsy();
    });
    it('should set lineservice.isShiftActive drawing to false', async () => {
        service.isSelected = false;
        const key = { key: 'Shift' } as KeyboardEvent;
        await service.onKeyUp(key);
        expect(service['lineService'].isShiftActive).toBeFalsy();
    });
    it('should not call removelineSpy', async () => {
        const spy = spyOn(service['lineService'], 'removeLastLine').and.callThrough();
        service.isSelected = false;
        const key = { key: 'Backspace' } as KeyboardEvent;
        service['lineService'].nbOfClicks = 0;
        await service.onKeyUp(key);
        expect(spy).not.toHaveBeenCalled();
    });
    it('should  call removelineSpy', async () => {
        const spy = spyOn(service['lineService'], 'removeLastLine').and.callThrough();
        service.isSelected = false;
        const key = { key: 'Backspace' } as KeyboardEvent;
        service['lineService'].nbOfClicks = 2;
        service['lineService'].lineDraw.ctx = previewCtxSpy;
        service['lineService']['lastPosition'] = { x: 1, y: 1 };
        await service.onKeyUp(key);
        expect(spy).toHaveBeenCalled();
    });
    it('should set lineservice.isShiftActive drawing to false', async () => {
        service.isSelected = true;
        const key = { key: 'Shift' } as KeyboardEvent;
        await service.onKeyUp(key);
        expect(service['lineService'].isShiftActive).toBeFalsy();
    });
    it('should call removeLassoImage', () => {
        const lasso = {
            image: service.selectionBox.image,
            width: service.selectionBox.width,
            height: service.selectionBox.height,
        } as LassoUndoAttributes;
        lasso.mouseClicks = [
            { x: 1, y: 1 },
            { x: 1, y: 5 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        lasso.initialPoint = { x: 0, y: 0 };
        service.updateLassoImage(previewCtxSpy, lasso);
        expect(removeLassoImageSpy).toHaveBeenCalled();
    });
    it('should call drawimage', () => {
        const lasso = {
            image: service.selectionBox.image,
            width: service.selectionBox.width,
            height: service.selectionBox.height,
        } as LassoUndoAttributes;
        lasso.imageCanvas = service.selectionBox.imageCanvas;
        lasso.topLeft = { x: 0, y: 0 };
        service.updateLassoSelection(previewCtxSpy, lasso);
        expect(previewCtxSpy.drawImage).toHaveBeenCalled();
    });
    it('should call set lassoAttribute.tickness to 1', () => {
        service.isSelected = false;
        service.lassoAttributes.isLastPoint = true;
        service['lineService'].isDrawing = true;
        service['lineMouseMove']({ x: 0, y: 0 });
        expect(service.lassoAttributes.thickness).toBe(1);
    });
    it('should clear canvas', () => {
        service.isSelected = false;
        service['lineService'].nbOfClicks = 2;
        service['lineService']['lastPosition'] = { x: 1, y: 1 };
        service.lassoAttributes.isLastPoint = false;
        service['lineService'].isDrawing = true;
        service['lineMouseMove']({ x: 0, y: 0 });
        expect(service['drawingService'].clearCanvas).toHaveBeenCalled();
    });
    it('should set isSelected to true', () => {
        service.isSelected = false;
        service.lassoAttributes.isLastPoint = true;
        service.initialPoint = { x: 0, y: 0 };
        service.finalPoint = { x: 10, y: 10 };
        service['lineMouseUp']();
        expect(service.isSelected).toBeTruthy();
    });
    it('should set isDrawing to true', () => {
        service.lassoAttributes.isLastPoint = false;
        service.lassoAttributes.mouseClicks = [];
        service['lineMouseDown']({ x: 0, y: 0 });
        expect(service.return).toBeTruthy();
        expect(service['lineService'].isDrawing).toBeTruthy();
    });
    it('should set isDrawing to true', () => {
        service.lassoAttributes.isLastPoint = false;
        service['lineMouseDown']({ x: 0, y: 0 });
        expect(service['lineService'].isDrawing).toBeTruthy();
    });
    it('should not set isDrawing to false', () => {
        service.lassoAttributes.isLastPoint = true;
        service['lineService'].isDrawing = false;
        service['lineMouseDown']({ x: 0, y: 0 });
        expect(service['lineService'].isDrawing).toBeFalsy();
    });
    it('should set isSelected to true', () => {
        service.isSelected = true;
        service['lineMouseUp']();
        expect(service.isSelected).toBeTruthy();
    });
    it('should set isSelected to false', () => {
        service.isSelected = false;
        service.lassoAttributes.isLastPoint = false;
        service['lineMouseUp']();
        expect(service.isSelected).toBeFalsy();
    });
    it('should set,,,, isDrawing to true', () => {
        service.lassoAttributes.isLastPoint = false;
        service['lineService']['lastPosition'] = { x: 0, y: 0 };
        service['lineService'].mouseTransition = { x: 0, y: 0 };
        service['lineMouseDown']({ x: 1, y: 0 });
        expect(service['lineService'].isDrawing).toBeTruthy();
    });
});
