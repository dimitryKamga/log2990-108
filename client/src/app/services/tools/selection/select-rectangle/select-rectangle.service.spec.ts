// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)
// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : On voudrait acceder couvrir tous les cas de test

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { SelectionMode } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectRectangleService } from './select-rectangle.service';

describe('SelectRectangleService', () => {
    let service: SelectRectangleService;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let selectionBoxCanvasTestHelper: CanvasTestHelper;

    let setImageSpy: jasmine.Spy<any>;
    let getSelectedImageSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        selectionBoxCanvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(SelectRectangleService);
        service['drawingService'].previewCtx = previewCtxStub;
        setImageSpy = spyOn<any>(service, 'setImage').and.callThrough();
        getSelectedImageSpy = spyOn<any>(service, 'getSelectedImage').and.callThrough();

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
        service.previousLassoBox = {
            name: SelectionMode.LASSO,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            topLeft: { x: 0, y: 0 },
            initialPoint: { x: 0, y: 0 },
            imageCanvas: new CanvasTestHelper().canvas,
            imageContexte: new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D,
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

    it('updateImage should call ctx.fillRect', () => {
        const clearRectSpy = spyOn(previewCtxStub, 'fillRect').and.callThrough();
        service.updateImage(previewCtxStub, service.selectionBox);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('updateImage should call ctx.fillRect when movePaste is true', () => {
        service.movePaste = true;
        const clearRectSpy = spyOn(previewCtxStub, 'fillRect').and.callThrough();
        service.updateImage(previewCtxStub, service.selectionBox);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('clearImage should call ctx.fillRect', () => {
        const clearRectSpy = spyOn(previewCtxStub, 'fillRect').and.callThrough();
        service['clearImage'](previewCtxStub, service.selectionBox);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('clearImage should call ctx.fillRect', () => {
        service.movePaste = true;
        const clearRectSpy = spyOn(previewCtxStub, 'fillRect').and.callThrough();
        service['clearImage'](previewCtxStub, service.selectionBox);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('getSelectedImage should call setImage', () => {
        service['getSelectedImage'](service.controlPoints, previewCtxStub);
        expect(setImageSpy).toHaveBeenCalled();
        expect(getSelectedImageSpy).toHaveBeenCalled();
    });
});
