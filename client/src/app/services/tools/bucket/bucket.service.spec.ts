import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MIN_TOLERANCE } from '@app/classes/constants/draw-constants';
import { MouseButton } from '@app/classes/enums/draw-enums';
import { Rgba } from '@app/classes/interfaces/color-interface';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { BehaviorSubject } from 'rxjs';
import { BucketService } from './bucket.service';

// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('BucketService', () => {
    let service: BucketService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let baseCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;
    undoRedoPilesSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool', 'handlePiles']);

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'baseCtx',
            'clearCanvas',
            'previewCtx',
            'getCanvasBaseData',
            'putImageData',
            'getPixelData',
            'canvas',
            'autoSave',
        ]);
        baseCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', ['putImageData']);
        drawingServiceSpy.baseCtx = baseCtxSpy;

        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init', 'getRgba']);

        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],

            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPilesSpy },
            ],
        });
        service = TestBed.inject(BucketService);
        service.bucketAttributes = {
            name: service.name,
            mainColor: service['colorService'].primaryColor,
            secondaryColor: service['colorService'].secondaryColor,
            thickness: 1,
            tolerance: new BehaviorSubject<number>(MIN_TOLERANCE),
            imageData: service.canvasImageData,
        };
        service.canvasImageData = drawingServiceSpy.getCanvasBaseData();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set  tolerance', () => {
        const tolerance = 1;
        service.setTolerance(tolerance);
        expect(service.bucketAttributes.tolerance.getValue()).toBe(tolerance);
    });

    it('should change if tolerance change', () => {
        const tolerance = 2;
        service.setTolerance(tolerance);
        let expectedTolerance = 0;
        service.getTolerance().subscribe((value: number) => {
            expectedTolerance = value;
        });
        expect(expectedTolerance).toEqual(tolerance);
    });

    it('onMouseDown should call contiguousFill', () => {
        const event = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
        const spy = spyOn<any>(service, 'contiguousFill');

        service.onMouseDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it(' onMouseDown should getPixelData', () => {
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.MIDDLE,
        } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(drawingServiceSpy.getPixelData).toHaveBeenCalledWith({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    });

    it('onMouseDown should call fillSameColor', () => {
        const event = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        const spy = spyOn<any>(service, 'fillSameColor');

        service.onMouseDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should set color', () => {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 20;
        canvas.width = 10;

        const canvasCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasCtx.fillStyle = 'green';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.strokeStyle = 'purple';
        canvasCtx.strokeRect(0, 0, 5, 5);

        drawingServiceSpy.baseCtx = canvasCtx;
        drawingServiceSpy.canvas = canvas;

        const rgba: Rgba = {
            RED: 0,
            GREEN: 0,
            BLUE: 255,
            ALPHA: 255,
        };
        colorServiceSpy.getRgba.and.returnValue(rgba);

        const data: ImageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
        const index = 2;

        service['setColor'](index, data);
        expect(colorServiceSpy.getRgba).toHaveBeenCalled();
    });

    it('should find borders', () => {
        const pixelStack: Vec2[] = [];
        const current = { x: 0, y: 0 };
        service['findBorders'](pixelStack, current);
        pixelStack.push(current);
        expect(pixelStack[0]).toEqual(current);
    });

    it('should find borders 2', () => {
        drawingServiceSpy.canvas.width = 2;
        drawingServiceSpy.canvas.height = 6;

        const pixelStack: Vec2[] = [];
        const current = { x: 1, y: 2 };
        service['findBorders'](pixelStack, current);
        expect(current.x).toBeLessThan(drawingServiceSpy.canvas.width);
        expect(current.y).toBeLessThan(drawingServiceSpy.canvas.height);
    });

    it('should find pixels and contiguous fill shape', () => {
        const tempCanvas: HTMLCanvasElement = document.createElement('canvas');
        tempCanvas.height = 20;
        tempCanvas.width = 10;
        const tempCanvasCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCanvasCtx.fillStyle = 'green';
        tempCanvasCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCanvasCtx.strokeStyle = 'purple';
        tempCanvasCtx.strokeRect(0, 0, 5, 5);
        tempCanvasCtx.fillStyle = 'blue';
        tempCanvasCtx.fillRect(1, 1, 3, 3);

        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 20;
        canvas.width = 10;
        const canvasCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasCtx.fillStyle = 'green';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.strokeStyle = 'purple';
        canvasCtx.strokeRect(0, 0, 5, 5);

        service.mouseDownCoord = { x: 2, y: 2 };

        drawingServiceSpy.baseCtx = canvasCtx;
        drawingServiceSpy.canvas = canvas;
        drawingServiceSpy.getPixelData.and.returnValue(canvasCtx.getImageData(service.mouseDownCoord.x, service.mouseDownCoord.y, 1, 1).data);
        drawingServiceSpy.getCanvasBaseData.and.returnValue(canvasCtx.getImageData(0, 0, canvas.width, canvas.height));

        const rgba: Rgba = {
            RED: 0,
            GREEN: 0,
            BLUE: 255,
            ALPHA: 255,
        };
        colorServiceSpy.getRgba.and.returnValue(rgba);

        service['contiguousFill']();
        expect(undoRedoPilesSpy.handlePiles).toHaveBeenCalled();
    });

    it(' should fill shapes and get color on canvas', () => {
        const tempCanvas: HTMLCanvasElement = document.createElement('canvas');
        tempCanvas.height = 10;
        tempCanvas.width = 10;
        const tempCanvasCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
        tempCanvasCtx.fillStyle = 'purple';
        tempCanvasCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCanvasCtx.fillStyle = 'black';
        tempCanvasCtx.fillRect(0, 0, 3, 3);
        tempCanvasCtx.fillRect(5, 5, 3, 3);

        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.height = 10;
        canvas.width = 10;
        const canvasCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasCtx.fillStyle = 'purple';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = 'blue';
        canvasCtx.fillRect(0, 0, 3, 3);
        canvasCtx.fillRect(5, 5, 3, 3);

        service.mouseDownCoord = { x: 1, y: 1 };

        drawingServiceSpy.baseCtx = canvasCtx;
        drawingServiceSpy.canvas = canvas;
        drawingServiceSpy.getPixelData.and.returnValue(canvasCtx.getImageData(service.mouseDownCoord.x, service.mouseDownCoord.y, 1, 1).data);
        drawingServiceSpy.getCanvasBaseData.and.returnValue(canvasCtx.getImageData(0, 0, canvas.width, canvas.height));

        const rgba: Rgba = {
            RED: 0,
            GREEN: 0,
            BLUE: 0,
            ALPHA: 255,
        };
        colorServiceSpy.getRgba.and.returnValue(rgba);

        service['fillSameColor']();

        const canvasData: ImageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
        const tempData: ImageData = tempCanvasCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        expect(canvasData).toEqual(tempData);
        expect(undoRedoPilesSpy.handlePiles).toHaveBeenCalled();
    });

    it('should return Vec2 as string value', () => {
        const vector: Vec2 = { x: 2, y: 4 };
        const expectedString = '2,4';
        expect(service['toString'](vector)).toBe(expectedString);
    });

    it('should change in tolerance range', () => {
        const pixelData: Uint8ClampedArray = new Uint8ClampedArray([255, 4, 255, 37]);
        const canvasData: ImageData = { data: new Uint8ClampedArray([255, 4, 255, 37, 0, 0, 0, 255]), height: 7, width: 2 };
        const index = 0;

        service.bucketAttributes.tolerance.next(20);

        expect(service['isInToleranceValue'](pixelData, canvasData, index)).toBe(true);
    });

    it('should update bucket attributes', () => {
        service.updateBucketAttributes(service.bucketAttributes);
        expect(drawingServiceSpy.baseCtx.putImageData).toHaveBeenCalled();
    });
});
