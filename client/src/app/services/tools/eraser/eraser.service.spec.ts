import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { EraserService } from './eraser.service';

// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('EraserService', () => {
    let service: EraserService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawSquareSpy: jasmine.Spy<any>;
    let clearPathSpy: jasmine.Spy<any>;
    let eraseLineSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        undoRedoPilesSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool', 'handlePiles']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPilesSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EraserService);
        drawSquareSpy = spyOn<any>(service, 'drawEraserSquare').and.callThrough();
        clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        eraseLineSpy = spyOn<any>(service, 'eraseLine').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
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

    it('setThickness should update ', () => {
        const thickness = 2;
        service.setThickness(thickness);
        expect(service.eraserAttributes.thickness).toBe(thickness);
    });

    it('OnMouseDown should  call clearPath,  drawSquare and not call eraseLine if mousedown false', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;

        service.onMouseDown(mouseEventRClick);
        expect(drawSquareSpy).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it('OnMouseUp should call drawSquare,  and not call eraseLine and clearPath if mousedown false', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(service['undoRedoPiles'].handlePiles).toHaveBeenCalled();
        expect(drawSquareSpy).toHaveBeenCalled();
        expect(clearPathSpy).not.toHaveBeenCalled();
    });

    it('OnMouseUp should call eraseLine and clearPath and set mousedown to false if mousedown true', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(clearPathSpy).toHaveBeenCalled();
        expect(eraseLineSpy).toHaveBeenCalled();
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
        expect(service.mouseDown).toBe(false);
    });

    it('OnMouseMove should call drawSquare and not call eraseLine  if mousedown false', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseMove(mouseEvent);
        expect(eraseLineSpy).not.toHaveBeenCalled();
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it('OnMouseMove should call drawSquare and  call eraseLine  if mousedown true', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseMove(mouseEvent);
        expect(eraseLineSpy).toHaveBeenCalled();
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it('OnMouseLeave should call clearPath if mouseDown true', () => {
        service.mouseDown = true;

        service.onMouseLeave();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it('OnMouseLeave should not call clearPath if mouseDown false', () => {
        service.mouseDown = false;

        service.onMouseLeave();
        expect(clearPathSpy).not.toHaveBeenCalled();
    });

    it('OnMouseEnter should  call drawSquarre and set mouseDown false if left button not cliked', () => {
        service.mouseDown = true;
        mouseEvent = { offsetX: 0, offsetY: 0, buttons: 0 } as MouseEvent;
        service.onMouseEnter(mouseEvent);
        expect(drawSquareSpy).toHaveBeenCalled();
        expect(service.mouseDown).toBe(false);
    });

    it('onMuseEnter should not  set mouseDown to false if left button is pressed', () => {
        service.mouseDown = true;
        mouseEvent = { offsetX: 0, offsetY: 0, buttons: 3 } as MouseEvent;
        service.onMouseEnter(mouseEvent);
        expect(service.mouseDown).toBe(true);
    });
});
