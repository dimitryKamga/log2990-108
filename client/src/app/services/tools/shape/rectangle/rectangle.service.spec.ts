// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { RectangleService } from './rectangle.service';

describe('RectangleService', () => {
    let service: RectangleService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RectangleService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        // tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' setThickness shoud set the thickness', () => {
        const thickness = 10;
        service.rectangleAttributes.thickness = 1;
        service.setThickness(thickness);
        expect(service.rectangleAttributes.thickness).toEqual(thickness);
    });
    it(' setStyle shoud set the style', () => {
        const style = 2;
        service.rectangleAttributes.style = 1;
        service.setStyle(style);
        expect(service.rectangleAttributes.style).toEqual(style);
    });

    it(' drawShape shoud call ctx.rect if shift is down', () => {
        const spy = spyOn<any>(baseCtxStub, 'rect').and.callFake(() => {});
        service.isShiftDown = true;
        service.rectangleAttributes.initialPoint = { x: 10, y: 20 };
        service.rectangleAttributes.height = 2;
        service.rectangleAttributes.width = 1;
        service.rectangleAttributes.style = 1;
        service['drawShape'](baseCtxStub, service.rectangleAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it('shoud setShapeStyleAndThickness', () => {
        service.rectangleAttributes.thickness = 1;
        service.shapeAttributes.thickness = 2;
        service['setShapeStyleAndThickness'](service.shapeAttributes);
        expect(service.shapeAttributes.thickness).toEqual(service.shapeAttributes.thickness);
    });

    it(' drawShape shoud call setRectangleWidthAndHeight if style is fill', () => {
        const spy = spyOn<any>(service, 'setRectangleWidthAndHeight').and.callFake(() => {});
        service.rectangleAttributes.initialPoint = { x: 10, y: 20 };
        service.rectangleAttributes.height = 1;
        service.rectangleAttributes.width = 1;
        service.rectangleAttributes.style = 1;
        service['drawShape'](baseCtxStub, service.rectangleAttributes);
        expect(spy).toHaveBeenCalled();
    });
    it(' drawRect shoud call setContextStyle', () => {
        const spy = spyOn<any>(service, 'setRectangleWidthAndHeight').and.callFake(() => {});
        service.rectangleAttributes.initialPoint = { x: 10, y: 20 };
        service.rectangleAttributes.height = 1;
        service.rectangleAttributes.width = 1;
        service.rectangleAttributes.style = 1;
        service['drawShape'](baseCtxStub, service.rectangleAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it(' setRectangleWidthAndHeight should set rectangle width', () => {
        const width = -5;
        service.shapeAttributes.initialPoint = { x: 10, y: 0 };
        service.shapeAttributes.finalPoint = { x: 5, y: 3 };
        service['setRectangleWidthAndHeight'](service.shapeAttributes, service.rectangleAttributes);
        expect(service.rectangleAttributes.width).toEqual(width);
    });
});
