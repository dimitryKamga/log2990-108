// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : On voudrait acceder couvrir tous les cas de test

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectService } from '@app/services/tools/selection/select/select.service';
import { SelectEllipseService } from './select-ellipse.service';

describe('SelectEllipseService', () => {
    let service: SelectEllipseService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let selectServiceSpy: jasmine.SpyObj<SelectService>;
    let selectionBoxCanvasTestHelper: CanvasTestHelper;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;

    let setBackgroundSpy: jasmine.Spy<any>;
    let setEllipseImageSpy: jasmine.Spy<any>;
    let setImageSpy: jasmine.Spy<any>;

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

        selectionBoxCanvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(SelectEllipseService);

        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].baseCtx = baseCtxStub;

        setEllipseImageSpy = spyOn<any>(service, 'setEllipseImage').and.callThrough();
        setImageSpy = spyOn<any>(service, 'setImage').and.callThrough();
        setBackgroundSpy = spyOn<any>(service, 'setBackground').and.callThrough();

        service.selectionBox = {
            image: new ImageData(5, 5),
            width: 0,
            height: 0,
            mainColor: '',
            secondaryColor: '',
            name: '',
            thickness: 1,
            topLeft: { x: 10, y: 10 },
            initialPoint: { x: 10, y: 10 },
            imageCanvas: selectionBoxCanvasTestHelper.canvas,
            imageContexte: selectionBoxCanvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D,
        };

        service.previousSelectionBox = {
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            mainColor: '',
            secondaryColor: '',
            name: service.selectionMode,
            thickness: 1,
            topLeft: { x: 0, y: 0 },
            initialPoint: { x: 0, y: 0 },
            imageCanvas: service.canvasVignete,
            imageContexte: service.canvasVigneteCtx,
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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should draw selection box', () => {
        service.boundingBox = true;
        service['drawSelectionBox'](service.controlPoints, drawServiceSpy.previewCtx);
        expect(previewCtxSpy.beginPath).toHaveBeenCalled();
        expect(previewCtxSpy.ellipse).toHaveBeenCalled();
        expect(previewCtxSpy.stroke).toHaveBeenCalled();
    });

    it('should call setEllipseImage', () => {
        service.boundingBox = true;
        service['setEllipseImage']();
        expect(service.selectionBox.image.data[1]).toBe(0);
    });

    it('should draw selection box', () => {
        service.boundingBox = false;
        service['drawSelectionBox'](service.controlPoints, drawServiceSpy.previewCtx);
        expect(previewCtxSpy.beginPath).toHaveBeenCalled();
        expect(previewCtxSpy.ellipse).toHaveBeenCalled();
        expect(previewCtxSpy.stroke).toHaveBeenCalled();
    });

    it('should not draw selection box', () => {
        service.boundingBox = false;
        service['drawSelectionBox'](service.controlPoints, drawServiceSpy.previewCtx);
        expect(service.boundingBox).not.toBeTrue();
    });

    it('getSelectedImage should call super.getSelectedImage,setEllipseImage and  setImage', () => {
        service['getSelectedImage'](service.controlPoints, drawServiceSpy.baseCtx);
        expect(setBackgroundSpy).toHaveBeenCalled();
        expect(setEllipseImageSpy).toHaveBeenCalled();
        expect(setImageSpy).toHaveBeenCalled();
    });

    it('clearImage sould call ctx.beginPath, ctx.ellipse and ctx.fill ', () => {
        service['clearImage'](drawServiceSpy.previewCtx, service.selectionBox);
        expect(previewCtxSpy.beginPath).toHaveBeenCalled();
        expect(previewCtxSpy.ellipse).toHaveBeenCalled();
        expect(previewCtxSpy.fill).toHaveBeenCalled();
    });

    it('clearImage sould call ctx.beginPath, ctx.ellipse and ctx.fill if movePaste', () => {
        service.movePaste = true;
        service['clearImage'](drawServiceSpy.previewCtx, service.selectionBox);
        expect(previewCtxSpy.beginPath).toHaveBeenCalled();
        expect(previewCtxSpy.ellipse).toHaveBeenCalled();
        expect(previewCtxSpy.fill).toHaveBeenCalled();
    });

    it('updateImage sould call ctx.beginPath, ctx.ellipse and ctx.fill ', () => {
        service.updateImage(drawServiceSpy.previewCtx, service.selectionBox);
        expect(previewCtxSpy.beginPath).toHaveBeenCalled();
        expect(previewCtxSpy.ellipse).toHaveBeenCalled();
        expect(previewCtxSpy.fill).toHaveBeenCalled();
    });

    it('updateImage sould call ctx.beginPath, ctx.ellipse and ctx.fill if movePaste', () => {
        service.movePaste = true;
        service.updateImage(drawServiceSpy.previewCtx, service.selectionBox);
        expect(previewCtxSpy.beginPath).toHaveBeenCalled();
        expect(previewCtxSpy.ellipse).toHaveBeenCalled();
        expect(previewCtxSpy.fill).toHaveBeenCalled();
    });
});
