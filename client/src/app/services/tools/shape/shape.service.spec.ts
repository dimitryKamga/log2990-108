// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { ShapeService } from './shape.service';

describe('ShapeService', () => {
    let service: ShapeService;
    let mouseEvent: MouseEvent;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;

    beforeEach(() => {
        undoRedoPilesSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool', 'handlePiles']);
        TestBed.configureTestingModule({ providers: [{ provide: UndoRedoPilesService, useValue: undoRedoPilesSpy }] });
        service = TestBed.inject(ShapeService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 5,
            offsetY: 5,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseDown should set the mouseDown to true if mouse is down', () => {
        service.mouseDown = false;
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });
    it(' onMouseDown should not set the mouseDown to true if mouse is not down', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.mouseDown = false;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });
    it(' onMouseDown should set the initialPoint if mouse is down', () => {
        const expectedValue: Vec2 = { x: 5, y: 5 };
        service.shapeAttributes.initialPoint = { x: 2, y: 3 };
        service.onMouseDown(mouseEvent);
        expect(service.shapeAttributes.initialPoint).toEqual(expectedValue);
    });
    it(' onMouseDown should not set the initialPoint if mouse is not down', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        const expectedValue: Vec2 = { x: 2, y: 3 };
        service.shapeAttributes.initialPoint = { x: 2, y: 3 };
        service.onMouseDown(mouseEventRClick);

        expect(service.shapeAttributes.initialPoint).toEqual(expectedValue);
    });

    it(' onMouseUp should set the finalPoint if mouse was down', () => {
        const expectedValue: Vec2 = { x: 5, y: 5 };
        service.mouseDown = true;
        service.shapeAttributes.finalPoint = { x: 2, y: 3 };
        service.onMouseUp(mouseEvent);

        expect(service.shapeAttributes.finalPoint).toEqual(expectedValue);
    });
    it(' onMouseUp should not set the finalPoint if mouse not was down', () => {
        const expectedValue: Vec2 = { x: 2, y: 3 };
        service.mouseDown = false;
        service.shapeAttributes.finalPoint = { x: 2, y: 3 };
        service.onMouseUp(mouseEvent);
        expect(undoRedoPilesSpy.setSelectedTool).not.toHaveBeenCalled();
        expect(service.shapeAttributes.finalPoint).toEqual(expectedValue);
    });

    it(' onMouseMove should set the finalPoint if mouse was down', () => {
        const expectedValue: Vec2 = { x: 5, y: 5 };
        service.mouseDown = true;
        service.shapeAttributes.finalPoint = { x: 2, y: 3 };
        service.onMouseMove(mouseEvent);
        expect(service.shapeAttributes.finalPoint).toEqual(expectedValue);
    });
    it(' onMouseMove should not set the finalPoint if mouse not was down', () => {
        const expectedValue: Vec2 = { x: 2, y: 3 };
        service.mouseDown = false;
        service.shapeAttributes.finalPoint = { x: 2, y: 3 };
        service.onMouseMove(mouseEvent);
        expect(service.shapeAttributes.finalPoint).toEqual(expectedValue);
    });

    it(' onMouseLeave should call draw if mouse is down', () => {
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.mouseDown = true;
        service.onMouseLeave();
        expect(spy).toHaveBeenCalled();
    });
    it(' onMouseLeave should not call draw if mouse is not down', () => {
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.mouseDown = false;
        service.onMouseLeave();
        expect(spy).not.toHaveBeenCalled();
    });

    it(' onKeyDown should call draw if mouse is down and shift is down', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: true });
        service.mouseDown = true;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });
    it(' onKeyDown should not call draw if mouse is not down and shift is down', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: true });
        service.mouseDown = false;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyDown(event);
        expect(spy).not.toHaveBeenCalled();
    });
    it(' onKeyDown should not call draw if mouse is down and shift is not down', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: false });
        service.mouseDown = true;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyDown(event);
        expect(spy).not.toHaveBeenCalled();
    });
    it(' onKeyDown should not call draw if mouse and shift are not down', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: false });
        service.mouseDown = false;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyDown(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it(' onKeyUp should not call draw if mouse and shift are down', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: true });
        service.mouseDown = true;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyUp(event);
        expect(spy).not.toHaveBeenCalled();
    });
    it(' onKeyUp should not call draw if mouse and shift are not down', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: false });
        service.mouseDown = false;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyUp(event);
        expect(spy).not.toHaveBeenCalled();
    });
    it(' onKeyUp should not call draw if mouse is not down and shift is down', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: true });
        service.mouseDown = false;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyUp(event);
        expect(spy).not.toHaveBeenCalled();
    });
    it(' onKeyUp should call draw if mouse is down and shift is not down', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: false });
        service.mouseDown = true;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyUp(event);
        expect(spy).toHaveBeenCalled();
    });

    it(' draw shoud call ctx.fill() if style is fill', () => {
        const spy = spyOn<any>(baseCtxStub, 'fill').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.shapeAttributes.style = 1;
        service['draw'](baseCtxStub, service.shapeAttributes);
        expect(spy).toHaveBeenCalled();
    });
    it(' draw shoud call setContextStyle', () => {
        const spy = spyOn<any>(service, 'setContextStyle').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service['draw'](baseCtxStub, service.shapeAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it('shoud checkShapeIsInCanvas', () => {
        service.shapeAttributes.finalPoint = { x: service['drawingService'].canvas.width + 1, y: 20 };
        service['checkShapeIsInCanvas'](service.shapeAttributes, 2);
        expect(service.shapeAttributes.finalPoint.x).toEqual(service['drawingService'].canvas.width - 2);
    });

    it('shoud checkShapeIsInCanvas', () => {
        service.shapeAttributes.finalPoint = { x: 20, y: service['drawingService'].canvas.width + 1 };
        service['checkShapeIsInCanvas'](service.shapeAttributes, 2);
        expect(service.shapeAttributes.finalPoint.y).toEqual(service['drawingService'].canvas.width - 2);
    });

    it('shoud setBoundingBoxStyle', () => {
        baseCtxStub.lineWidth = 2;
        service['setBoundingBoxStyle'](baseCtxStub);
        expect(baseCtxStub.lineWidth).toEqual(1);
    });
});
