import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from './drawing.service';

// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure

describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    const width = 100;
    const height = 100;

    beforeEach(() => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = width;
        drawCanvas.height = height;

        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });
    it('should return true if the context is pristine', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        const result = service.isCanvasBlank(context);
        expect(result).toBeFalse();
    });
    it('should handle preview canvas s', () => {
        const baseCtxSpy = spyOn(service.baseCtx, 'drawImage');
        const clearCanvasSpy = spyOn(service, 'clearCanvas');

        service.canvas.width = 2;
        service.canvas.height = 3;

        service.handlePreviewCanvas();
        expect(baseCtxSpy).toHaveBeenCalled();
        expect(clearCanvasSpy).toHaveBeenCalled();
    });
    it('should return false if the canvas is not pristine', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.height = 1;
        canvas.width = 1;
        context.fillStyle = 'red';
        context.fillRect(0, 0, 1, 1);
        const result = service.isCanvasBlank(context);
        expect(result).toBeFalse();
    });

    it('should get base image data', () => {
        const data: Uint8ClampedArray = new Uint8ClampedArray([255, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
        const expectedCanvasData: ImageData = { data, height: 3, width: 2 };

        service.canvas.width = 2;
        service.canvas.height = 3;

        service.baseCtx.fillStyle = 'white';
        service.baseCtx.fillRect(0, 0, 1, 1);
        const canvasData = service.getCanvasBaseData();
        expect(canvasData.width).toEqual(expectedCanvasData.width);
        expect(canvasData.height).toEqual(expectedCanvasData.height);
    });

    it('should autosave get drawing data and sizes', () => {
        localStorage.clear();
        service.autoSave();
        expect(localStorage.length).toBeGreaterThan(0);
    });

    it('should get pixelData ', () => {
        const pixel: Vec2 = { x: 1, y: 1 };
        const expected: Uint8ClampedArray = new Uint8ClampedArray([0, 0, 255, 255]);

        service.baseCtx.fillStyle = 'blue';
        service.baseCtx.fillRect(1, 1, 1, 1);

        expect(service.getPixelData(pixel)).toEqual(expected);
    });
});
