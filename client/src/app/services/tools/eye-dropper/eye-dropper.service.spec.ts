import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

import { EyedropperService } from './eye-dropper.service';

// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure

describe('EyedropperService', () => {
    let service: EyedropperService;
    let mouseEvent: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let mouseEventMiddleClick: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let canvasTestHelperService: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let rgbToHexSpy: jasmine.Spy<any>;
    let getPixelColorSpy: jasmine.Spy<any>;
    let drawVisualisationCircleSpy: jasmine.Spy<any>;
    let getPixelOpacitySpy: jasmine.SpyObj<any>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['hexToRGBA']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasTestHelperService = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EyedropperService);
        service.canvas = canvasTestHelperService.canvas;
        service.baseCtx = canvasTestHelperService.canvas.getContext('2d') as CanvasRenderingContext2D;
        rgbToHexSpy = spyOn<any>(service, 'rgbToHex').and.callThrough();
        getPixelColorSpy = spyOn<any>(service, 'getPixelColor').and.callThrough();
        drawVisualisationCircleSpy = spyOn<any>(service, 'drawVisualisationCircle').and.callThrough();
        getPixelOpacitySpy = spyOn<any>(service, 'getPixelOpacity').and.callThrough();
        // Configuration du spy du service
        // tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasTestHelper.canvas;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;

        mouseEventMiddleClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;

        mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 2,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('On mouseDown should call rgbToHex and getPixelColor if left button  clicked', () => {
        service.onMouseDown(mouseEvent);
        expect(rgbToHexSpy).toHaveBeenCalled();
        expect(getPixelColorSpy).toHaveBeenCalled();
        expect(getPixelOpacitySpy).toHaveBeenCalled();
    });

    it('On mouseDown should not call rgbToHex and not call  getPixelColor if left button not clicked', () => {
        service.onMouseDown(mouseEventMiddleClick);
        expect(rgbToHexSpy).not.toHaveBeenCalled();
        expect(getPixelColorSpy).not.toHaveBeenCalled();
        expect(getPixelOpacitySpy).not.toHaveBeenCalled();
    });

    it('On mouseDown should call rgbToHex and getPixelColor if right button  clicked', () => {
        service.onMouseDown(mouseEventRClick);
        expect(rgbToHexSpy).toHaveBeenCalled();
        expect(getPixelColorSpy).toHaveBeenCalled();
        expect(getPixelOpacitySpy).toHaveBeenCalled();
    });

    it('On mouseDown should not call rgbToHex and not call  getPixelColor if right button not clicked', () => {
        service.onMouseDown(mouseEventMiddleClick);
        expect(rgbToHexSpy).not.toHaveBeenCalled();
        expect(getPixelColorSpy).not.toHaveBeenCalled();
        expect(getPixelOpacitySpy).not.toHaveBeenCalled();
    });

    it('On mouseMove should update showVisualisationPanel to true', () => {
        service.onMouseMove(mouseEvent);
        expect(service.showVisualisationPanel).toBe(true);
    });

    it('On mouseLeave should update showVisualisationPanel to false', () => {
        service.onMouseLeave();
        expect(service.showVisualisationPanel).toBe(false);
    });

    it('On mouseMove should update showVisualisationPanel to true and call drawVisualisationCircl', () => {
        service.showVisualisationPanel = false;
        service.onMouseMove(mouseEvent);
        expect(service.showVisualisationPanel).toBe(true);
        expect(drawVisualisationCircleSpy).toHaveBeenCalled();
    });

    it('getPixelOpacity should return the real opacity o the pixel if something is drawn under the mouse click', () => {
        baseCtxStub.fillStyle = 'red';
        baseCtxStub.fillRect(20, 20, 100, 100);
        service.onMouseDown(mouseEvent);
        expect(rgbToHexSpy).toHaveBeenCalled();
        expect(getPixelColorSpy).toHaveBeenCalled();
        expect(getPixelOpacitySpy).toHaveBeenCalled();
    });
});
