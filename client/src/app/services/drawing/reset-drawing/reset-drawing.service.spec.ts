import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResetToolsService } from '@app/services/reset-tools/reset-tools.service';
import { ResetDrawingService } from './reset-drawing.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('ResetDrawingService', () => {
    let service: ResetDrawingService;
    let resetToolsServiceSpy: jasmine.SpyObj<ResetToolsService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawResizerServiceSpy: jasmine.SpyObj<DrawingResizerService>;

    beforeEach(() => {
        resetToolsServiceSpy = jasmine.createSpyObj('ResetToolsService', ['initializeTools']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'canvas', 'setPixelColor']);
        drawResizerServiceSpy = jasmine.createSpyObj('DrawingResizerService', ['applyCanvasDefaultSize']);

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ResetToolsService, useValue: resetToolsServiceSpy },
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: DrawingResizerService, useValue: drawResizerServiceSpy },
            ],
        });
        service = TestBed.inject(ResetDrawingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call resetDrawing if isReset is true', () => {
        /*  const clearCanvasSpy = spyOn(service['drawingService'], 'clearCanvas');
        const applyCanvasDefaultSizeSpy = spyOn(service['drawingResizerService'], 'applyCanvasDefaultSize'); */
        service.resetDrawing(true);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(resetToolsServiceSpy.initializeTools).toHaveBeenCalled();
        expect(drawResizerServiceSpy.applyCanvasDefaultSize).toHaveBeenCalled();
    });
    it('should call resetDrawing if isReset is false', () => {
        //  const applyCanvasDefaultSizeSpy = spyOn(service['drawingResizerService'], 'applyCanvasDefaultSize');
        service.resetDrawing(false);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(resetToolsServiceSpy.initializeTools).not.toHaveBeenCalled();
        expect(drawResizerServiceSpy.applyCanvasDefaultSize).not.toHaveBeenCalled();
    });
});
