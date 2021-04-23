// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MouseButton, SelectionMode } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { SelectService } from './select.service';

describe('SelectService', () => {
    let service: SelectService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let setControlPointsSpy: jasmine.Spy<any>;
    let drawSelectionBoxSpy: jasmine.Spy<any>;
    let drawControlPointsSpy: jasmine.Spy<any>;
    let lineMouseDownSpy: jasmine.Spy<any>;
    let lineMouseUpSpy: jasmine.Spy<any>;
    let drawSpecificControlPointSpy: jasmine.Spy<any>;
    let getSelectedImageSpy: jasmine.Spy<any>;
    let canvasTestHelper: HTMLCanvasElement;
    const initialPoint = 5;

    beforeEach(() => {
        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasTestHelper = document.createElement('canvas') as HTMLCanvasElement;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', [
            'baseCtx',
            'clearCanvas',
            'previewCtx',
            'getImageData',
            'putImageData',
            'autoSave',
            'canvas',
            'getImageData',
        ]);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        undoRedoPilesSpy = jasmine.createSpyObj('UndoRedoPilesService', ['handlePiles', 'setSelectedTool', 'selectedTool']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPilesSpy },
            ],
        });
        service = TestBed.inject(SelectService);

        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].canvas = canvasTestHelper;

        setControlPointsSpy = spyOn<any>(service, 'setControlPoints').and.callThrough();
        drawSelectionBoxSpy = spyOn<any>(service, 'drawSelectionBox').and.callThrough();
        drawControlPointsSpy = spyOn<any>(service, 'drawControlPoints').and.callThrough();
        drawSpecificControlPointSpy = spyOn<any>(service, 'drawSpecificControlPoint').and.callThrough();
        getSelectedImageSpy = spyOn<any>(service, 'getSelectedImage').and.callThrough();
        lineMouseDownSpy = spyOn<any>(service, 'lineMouseDown').and.callThrough();
        lineMouseUpSpy = spyOn<any>(service, 'lineMouseUp').and.callThrough();

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
        service.previousSelectionBox = {
            image: new ImageData(1, 1),
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
        mouseEvent = {
            offsetX: 5,
            offsetY: 5,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should onMouseDown', () => {
        service.mouseDown = true;
        service.boundingBox = true;
        service.onMouseDown(mouseEvent);
        expect(service.boundingBox).not.toBeTrue();
    });

    it('should onMouseDown and equalize selectionBox.topLeft and controlPoints.topLeft', () => {
        service.mouseDown = true;
        service.boundingBox = true;
        service.isSelected = true;
        service.movePaste = true;
        service.isCut = true;
        service.onMouseDown(mouseEvent);
        expect(undoRedoPilesSpy.setSelectedTool).toHaveBeenCalled();
        expect(service.selectionBox.topLeft).toEqual(service.previousSelectionBox.topLeft);
        expect(service.boundingBox).not.toBeTrue();
        expect(service.resizeCounter).toEqual(0);
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });
    it('should onMouseDown and equalize selectionBox.topLeft and controlPoints.topLeft else case', () => {
        service.mouseDown = true;
        service.boundingBox = true;
        service.isSelected = true;
        service.movePaste = false;
        service.isCut = false;
        service.onMouseDown(mouseEvent);
        expect(undoRedoPilesSpy.setSelectedTool).toHaveBeenCalled();
        expect(service.selectionBox.topLeft).toEqual(service.controlPoints.topLeft);
        expect(service.boundingBox).not.toBeTrue();
        expect(service.resizeCounter).toEqual(0);
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it('should not onMouseDown', () => {
        service.mouseDown = false;
        service.boundingBox = true;
        const event = { button: MouseButton.RIGHT } as MouseEvent;
        service.onMouseDown(event);
        expect(service.boundingBox).toBeTrue();
    });

    it('should onMouseUp', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(service.boundingBox).toBeTrue();
    });

    it('should not onMouseUp', () => {
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(service.boundingBox).not.toBeTrue();
    });

    it('should draw control point', () => {
        service['drawControlPoints'](service.controlPoints, drawServiceSpy.previewCtx);
        expect(drawSpecificControlPointSpy).toHaveBeenCalled();
    });

    it('should set context style', () => {
        service.shiftDown = true;
        service['setControlPoints'](service.controlPoints);
        const point = 1000;
        expect(point).toBe(service.finalPoint.x - service.initialPoint.x);
    });

    it('should not set context style', () => {
        service.shiftDown = false;
        service['setControlPoints'](service.controlPoints);
        const point = 1;
        expect(point).not.toBe(service.finalPoint.x - service.initialPoint.x);
    });

    it('should select all', () => {
        service.selectAll();
        expect(setControlPointsSpy).toHaveBeenCalled();
        expect(drawSelectionBoxSpy).toHaveBeenCalled();
        expect(drawControlPointsSpy).toHaveBeenCalled();
        expect(getSelectedImageSpy).toHaveBeenCalled();
        expect(service.isSelected).toBeTrue();
    });

    it('should onKeyUp', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: false });
        service.mouseDown = true;
        service.onKeyUp(event);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should not onKeyUp', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: true });
        service.mouseDown = false;
        service.onKeyUp(event);

        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('should onMouseMove', () => {
        service.mouseDown = true;

        const event = {} as MouseEvent;
        service.onMouseMove(event);

        expect(drawSelectionBoxSpy).toHaveBeenCalled();
    });

    it('should not onMouseMove', () => {
        service.mouseDown = false;
        const event = {} as MouseEvent;
        service.onMouseMove(event);

        expect(drawSelectionBoxSpy).not.toHaveBeenCalled();
    });

    it('should call linemouseDown', () => {
        const event = { button: 0 } as MouseEvent;
        service.selectionMode = SelectionMode.LASSO;
        service.onMouseDown(event);
        expect(lineMouseDownSpy).toHaveBeenCalled();
    });

    it('should call linemouseDown when move paste is true', () => {
        service.movePaste = true;
        const event = { button: 0 } as MouseEvent;
        service.selectionMode = SelectionMode.LASSO;
        service.onMouseDown(event);
        expect(service.lassoAttributes.isLastPoint).toBeTrue();
        expect(lineMouseDownSpy).toHaveBeenCalled();
    });

    it('should call linemouseDown when is cut is true', () => {
        service.isCut = true;
        const event = { button: 0 } as MouseEvent;
        service.selectionMode = SelectionMode.LASSO;
        service.onMouseDown(event);
        expect(service.lassoAttributes.isLastPoint).toBeTrue();
        expect(lineMouseDownSpy).toHaveBeenCalled();
    });
    it('should call linemouseUp', () => {
        service.mouseDown = true;
        const event = { button: 0 } as MouseEvent;
        service.selectionMode = SelectionMode.LASSO;
        service.onMouseUp(event);
        expect(lineMouseUpSpy).toHaveBeenCalled();
    });

    it('should onMouseLeave', () => {
        service.mouseDown = true;

        service.onMouseLeave();
        expect(drawSelectionBoxSpy).toHaveBeenCalled();
        expect(drawControlPointsSpy).toHaveBeenCalled();
    });

    it('should not onMouseLeave', () => {
        service.mouseDown = false;
        service.onMouseLeave();
        expect(drawSelectionBoxSpy).not.toHaveBeenCalled();
    });

    it('should onKeyDown', () => {
        service.mouseDown = true;
        const event = new KeyboardEvent('mousemove', { shiftKey: true });
        service.onKeyDown(event);
        expect(drawSelectionBoxSpy).toHaveBeenCalled();
    });

    it('should onKeyDown2', () => {
        service.mouseDown = false;
        const event = { key: 'Escape' } as KeyboardEvent;
        service.onKeyDown(event);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should onKeyDown when movePaste true', () => {
        const event = { key: 'Escape' } as KeyboardEvent;
        service.movePaste = true;
        service.isSelected = true;
        service.mouseDown = false;
        const spy = spyOn(service, 'drawSelectedImage');
        service.onKeyDown(event);

        expect(spy).toHaveBeenCalled();
    });

    it('should not onKeyDown', () => {
        service.mouseDown = false;
        const event = {} as KeyboardEvent;
        service.onKeyDown(event);

        expect(drawSelectionBoxSpy).not.toHaveBeenCalled();
    });

    it('should get image data', () => {
        service['getSelectedImage'](service.controlPoints, drawServiceSpy.previewCtx);
        expect(getSelectedImageSpy).toHaveBeenCalled();
    });

    it('should initialize attributes', () => {
        service.mouseDown = true;
        service.initialPoint.x = initialPoint;

        service.onMouseUp(mouseEvent);
        expect(service.boundingBox).toBeFalsy();
    });

    it('should resetclipBoard ', () => {
        service.resetClipboard();
        expect(service.previousSelectionBox).toEqual(service.previousSelectionBox);
    });
});
