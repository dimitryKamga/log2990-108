import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('PencilService', () => {
    let service: PencilService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;
    let clearPathSpy: jasmine.Spy<any>;

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
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(PencilService);
        drawLineSpy = spyOn<any>(service, 'drawPencil').and.callThrough();
        clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();

        // Configuration du spy du service
        // tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawLine and clearPath and clear the canvas for previewCtx if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseUp(mouseEvent);
        expect(service['undoRedoPiles'].handlePiles).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseUp should call drawLine and clearPath and clear the canvas for previewCtx if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' should change the pixel of the canvas ', () => {
        mouseEvent = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 1, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseUp(mouseEvent);

        // Premier pixel seulement
        const imageData: ImageData = baseCtxStub.getImageData(0, 0, 1, 1);
        expect(imageData.data[0]).toEqual(0); // R
        expect(imageData.data[1]).toEqual(0); // G
        expect(imageData.data[2]).toEqual(0); // B
        // tslint:disable-next-line: no-magic-numbers
        expect(imageData.data[3]).toEqual(0); // A
    });

    it('onMuseLeave should call clearPath if mouseDown was already pressed', () => {
        service.mouseDown = true;
        service.onMouseLeave();
        expect(clearPathSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onMuseLeave should always  call drawline and clear the canvas for previewCtx', () => {
        service.onMouseLeave();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onMuseLeave should always  decrement the coordonates of the points in path', () => {
        mouseEvent = { offsetX: 1, offsetY: 1, button: 0 } as MouseEvent;
        service.pencilAttributes.pathData = [];
        const position: Vec2 = service.getPositionFromMouse(mouseEvent);
        service.pencilAttributes.pathData.push(position);
        service.onMouseLeave();
        expect(service.pencilAttributes.pathData[0].x).toBe(0);
        expect(service.pencilAttributes.pathData[0].y).toBe(0);
    });

    it('onMouseLeave should not call clearPath if mouseDown was not already pressed', () => {
        service.mouseDown = false;
        service.onMouseLeave();
        expect(clearPathSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should should always  decrement the coordonates of the points in path', () => {
        mouseEvent = { offsetX: 1, offsetY: 1, button: 0 } as MouseEvent;
        service.pencilAttributes.pathData = [];
        const position: Vec2 = service.getPositionFromMouse(mouseEvent);
        service.pencilAttributes.pathData.push(position);
        service.onMouseLeave();
        expect(service.pencilAttributes.pathData[0].x).toBe(0);
        expect(service.pencilAttributes.pathData[0].y).toBe(0);
    });

    it('onMuseEnter should set mouseDown to false if none of the mouse button is pressed', () => {
        service.mouseDown = true;
        mouseEvent = { offsetX: 0, offsetY: 0, buttons: 0 } as MouseEvent;
        service.onMouseEnter(mouseEvent);
        expect(service.mouseDown).toBe(false);
    });

    it('onMuseEnter should not  set mouseDown to false if left button is pressed', () => {
        service.mouseDown = true;
        mouseEvent = { offsetX: 0, offsetY: 0, buttons: 3 } as MouseEvent;
        service.onMouseEnter(mouseEvent);
        expect(service.mouseDown).toBe(true);
    });

    it('setThickness should update ', () => {
        const thickness = 2;
        service.setThickness(thickness);
        expect(service.pencilAttributes.thickness).toBe(thickness);
    });
});
