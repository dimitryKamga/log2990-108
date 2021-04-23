import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LoadDrawingService } from './load-drawing.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('LoadDrawingService', () => {
    let service: LoadDrawingService;
    let drawingResizerServiceSpy: jasmine.SpyObj<DrawingResizerService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingResizerServiceSpy = jasmine.createSpyObj('DrawingResizerService', ['resizeBaseCanvas']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasBlank', 'drawImage', 'autoSave', 'setPixelColor']);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['drawImage']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: DrawingResizerService, useValue: drawingResizerServiceSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        service = TestBed.inject(LoadDrawingService);

        service['drawingService'].baseCtx = baseCtxSpy;
        drawingResizerServiceSpy.canvasSize = { x: 100, y: 200 };
        drawingResizerServiceSpy.resizingLayerSize = { x: 100, y: 200 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('loadPreviousDrawing should call loadDrawing', async () => {
        localStorage.setItem('data', '');

        const imgTest = new Image();
        let spy: jasmine.Spy;
        service.loadPreviousDrawing();
        spy = spyOn<any>(service, 'loadDrawing');
        imgTest.dispatchEvent(new Event('load'));
        expect(spy).toBeTruthy();
        expect(drawingServiceSpy.setPixelColor).toHaveBeenCalled();
    });

    it('loadPreviousDrawing should load Image', async () => {
        localStorage.setItem('width', '');
        localStorage.setItem('height', '');
        const imgTest = new Image();

        service['draw'](imgTest);
        expect(drawingResizerServiceSpy.resizeBaseCanvas).toHaveBeenCalled();
    });
});
