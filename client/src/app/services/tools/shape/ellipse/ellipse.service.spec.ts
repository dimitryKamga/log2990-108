import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { EllipseService } from './ellipse.service';
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)

describe('EllipseService', () => {
    let service: EllipseService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EllipseService);

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
        service.ellipseAttributes.thickness = 1;
        service.setThickness(thickness);
        expect(service.ellipseAttributes.thickness).toEqual(thickness);
    });

    it(' setStyle shoud set the style', () => {
        const style = 2;
        service.ellipseAttributes.style = 1;
        service.setStyle(style);
        expect(service.ellipseAttributes.style).toEqual(style);
    });

    it('shoud drawBoundingBox if is drawing', () => {
        const spy = spyOn<any>(baseCtxStub, 'rect').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.ellipseAttributes.radius = { x: 1, y: 1 };
        service.ellipseAttributes.center = { x: 1, y: 1 };
        service.isDrawing = true;
        service['drawBoundingBox'](baseCtxStub, service.shapeAttributes, service.ellipseAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it('shoud not drawBoundingBox if is not drawing', () => {
        const spy = spyOn<any>(baseCtxStub, 'rect').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.ellipseAttributes.radius = { x: 1, y: 1 };
        service.ellipseAttributes.center = { x: 1, y: 1 };
        service.isDrawing = false;
        service['drawBoundingBox'](baseCtxStub, service.shapeAttributes, service.ellipseAttributes);
        expect(spy).not.toHaveBeenCalled();
    });

    it('shoud drawBoundingBox if is shif down', () => {
        const spy = spyOn<any>(service['generalFunctions'], 'getDirection').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.ellipseAttributes.radius = { x: 1, y: 1 };
        service.ellipseAttributes.center = { x: 1, y: 1 };
        service.isDrawing = true;
        service.isShiftDown = true;
        service['drawBoundingBox'](baseCtxStub, service.shapeAttributes, service.ellipseAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it('shoud drawBoundingBox if is style is fill', () => {
        const spy = spyOn<any>(service['generalFunctions'], 'getDirection').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.ellipseAttributes.radius = { x: 1, y: 1 };
        service.ellipseAttributes.center = { x: 1, y: 1 };
        service.isDrawing = true;
        service.shapeAttributes.style = 1;
        service['drawBoundingBox'](baseCtxStub, service.shapeAttributes, service.ellipseAttributes);
        expect(spy).not.toHaveBeenCalled();
    });

    it('shoud setShapeStyleAndThickness', () => {
        service.ellipseAttributes.thickness = 1;
        service.shapeAttributes.thickness = 2;
        service['setShapeStyleAndThickness'](service.shapeAttributes);
        expect(service.shapeAttributes.thickness).toEqual(service.ellipseAttributes.thickness);
    });

    it(' drawShape shoud call ctx.ellipse if shift is down', () => {
        const spy = spyOn<any>(baseCtxStub, 'ellipse').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.ellipseAttributes.radius = { x: 1, y: 1 };
        service.ellipseAttributes.center = { x: 1, y: 1 };
        service.isShiftDown = true;
        service['drawShape'](baseCtxStub, service.ellipseAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it(' drawShape shoud call ctx.ellipse if shift is not down', () => {
        const spy = spyOn<any>(baseCtxStub, 'ellipse').and.callFake(() => {});
        service.shapeAttributes.initialPoint = { x: 10, y: 20 };
        service.ellipseAttributes.radius = { x: 1, y: 1 };
        service.ellipseAttributes.center = { x: 1, y: 1 };
        service.isShiftDown = false;
        service['drawShape'](baseCtxStub, service.ellipseAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it(' setEllipseRadiusAndCenter shoud set the center', () => {
        const point = { x: 5, y: 5 };
        service.shapeAttributes.initialPoint = { x: 0, y: 10 };
        service.shapeAttributes.finalPoint = { x: 10, y: 0 };
        service['setEllipseRadiusAndCenter'](service.shapeAttributes, service.ellipseAttributes);
        expect(service.ellipseAttributes.center).toEqual(point);
    });

    it(' setCircleRadiusAndCenter shoud set the circle radius', () => {
        const radius = { x: -5, y: 5 };
        service.ellipseAttributes.radius = { x: -5, y: 10 };
        service['setCircleRadiusAndCenter'](service.shapeAttributes, service.ellipseAttributes);
        expect(service.ellipseAttributes.circleRadius).toEqual(radius);
    });
});
