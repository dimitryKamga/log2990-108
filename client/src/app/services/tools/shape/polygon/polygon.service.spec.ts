import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { PolygonService } from './polygon.service';

// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)

describe('PolygonService', () => {
    let service: PolygonService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PolygonService);
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
        service.polygonAttributes.thickness = 1;
        service.setThickness(thickness);
        expect(service.polygonAttributes.thickness).toEqual(thickness);
    });

    it(' setStyle shoud set the style', () => {
        const style = 2;
        service.polygonAttributes.style = 1;
        service.setStyle(style);
        expect(service.polygonAttributes.style).toEqual(style);
    });

    it(' setSides shoud set the number of sides', () => {
        const nbSides = 7;
        const currentSides = 3;
        service.polygonAttributes.numberOfSides = currentSides;
        service.setSides(nbSides);
        expect(service.polygonAttributes.numberOfSides).toEqual(nbSides);
    });

    it(' drawShape shoud call setPolygonRadiusAndCenter', () => {
        const spy = spyOn<any>(service, 'setPolygonRadiusAndCenter').and.callFake(() => {});
        service.polygonAttributes.initialPoint = { x: 10, y: 20 };
        service.polygonAttributes.radius = 1;
        service.polygonAttributes.center = { x: 1, y: 1 };
        service.polygonAttributes.style = 1;
        service['drawShape'](baseCtxStub, service.shapeAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it(' setPolygonRadiusAndCenter shoud set the center', () => {
        const point = { x: 7, y: 7 };
        service.shapeAttributes.initialPoint = { x: 2, y: 12 };
        service.shapeAttributes.finalPoint = { x: 12, y: 2 };
        service['setPolygonRadiusAndCenter'](service.shapeAttributes, service.polygonAttributes);
        expect(service.polygonAttributes.center).toEqual(point);
    });

    it('shoud setShapeStyleAndThickness', () => {
        service.polygonAttributes.thickness = 1;
        service.shapeAttributes.thickness = 2;
        service['setShapeStyleAndThickness'](service.shapeAttributes);
        expect(service.shapeAttributes.thickness).toEqual(service.polygonAttributes.thickness);
    });

    it('shoud setShapeNumberOfSide', () => {
        service.polygonAttributes.numberOfSides = 1;
        service.shapeAttributes.numberOfSides = 2;
        service['setShapeNumberOfSide'](service.shapeAttributes);
        expect(service.shapeAttributes.numberOfSides).toEqual(service.polygonAttributes.numberOfSides);
    });

    it('shoud drawBoundingCircle if is drawing', () => {
        const spy = spyOn<any>(baseCtxStub, 'ellipse').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.polygonAttributes.radius = 1;
        service.polygonAttributes.center = { x: 1, y: 1 };
        service.isDrawing = true;
        service['drawBoundingCircle'](baseCtxStub, service.polygonAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it('shoud not drawBoundingCircle if is not drawing', () => {
        const spy = spyOn<any>(baseCtxStub, 'ellipse').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.polygonAttributes.radius = 1;
        service.polygonAttributes.center = { x: 1, y: 1 };
        service.isDrawing = false;
        service['drawBoundingCircle'](baseCtxStub, service.polygonAttributes);
        expect(spy).not.toHaveBeenCalled();
    });

    it(' onKeyDown should do nothing', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: true });
        service.mouseDown = true;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyDown(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it(' onKeyUp should do nothing', () => {
        const event = new KeyboardEvent('mousemove', { shiftKey: false });
        service.mouseDown = true;
        const spy = spyOn<any>(service, 'draw').and.callFake(() => {});
        service.onKeyUp(event);
        expect(spy).not.toHaveBeenCalled();
    });
});
