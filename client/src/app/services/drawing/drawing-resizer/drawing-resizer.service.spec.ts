import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MIN_HEIGHT, MIN_WIDTH, PHYSICAL_RESIZER_DIMENSIONS } from '@app/classes/constants/draw-constants';
import { ResizerLocation } from '@app/classes/enums/draw-enums';
import { ResizeAttributes } from '@app/classes/interfaces/tools-attributes';
import { Vec2 } from '@app/classes/vec2';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridService } from '@app/services/grid/grid.service';

// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('DrawingResizerService', () => {
    let service: DrawingResizerService;
    let mouseEvent: MouseEvent;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj(
            'DrawingService',
            ['isCanvasBlank', 'clearCanvas', 'autoSave', 'setPixelColor'],
            ['baseCtx, previewCtx, canvas'],
        );
        gridServiceSpy = jasmine.createSpyObj('GridService', ['clearGridCanvas', 'setGrid', 'gridHandler'], ['gridCtx, gridCanvas']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: GridService, useValue: gridServiceSpy },
            ],
        });
        service = TestBed.inject(DrawingResizerService);
        gridServiceSpy.gridCanvas = new CanvasTestHelper().canvas;
        drawingServiceSpy.canvas = new CanvasTestHelper().canvas;
        drawingServiceSpy.baseCtx = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.previewCtx = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        gridServiceSpy.gridCtx = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        service['lastPosition'] = { x: 0, y: 0 };
        mouseEvent = {
            clientX: 25,
            clientY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('applyCanvasDefaultSize should change canvas size to half workspace size if workspaceSize is more than 500px', () => {
        const workSpaceSize = { x: 800, y: 1000 };
        service.workSpaceSize = workSpaceSize;
        service.applyCanvasDefaultSize();
        expect(service.resizingLayerSize).toEqual({ x: workSpaceSize.x / 2, y: workSpaceSize.y / 2 });
        expect(service.canvasSize).toEqual({ x: workSpaceSize.x / 2, y: workSpaceSize.y / 2 });
    });
    it('applyCanvasDefaultSize should change canvas size to min canvas size if workspaceSize is less than 500px', () => {
        const workSpaceSize = { x: 100, y: 100 };
        service.workSpaceSize = workSpaceSize;
        gridServiceSpy.isEnabled = true;
        service.applyCanvasDefaultSize();
        expect(service.resizingLayerSize).toEqual({ x: MIN_WIDTH, y: MIN_WIDTH });
        expect(service.canvasSize).toEqual({ x: MIN_WIDTH, y: MIN_HEIGHT });
    });
    it(' onMouseUp should call resizeBaseCanvas if mouse was already down', () => {
        service['mouseDown'] = true;
        const resizeBaseCanvasSpy = spyOn<any>(service, 'resizeBaseCanvas').and.callThrough();
        service.onMouseUp();
        expect(resizeBaseCanvasSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.autoSave).toHaveBeenCalled();
    });
    it(' onMouseUp should not call resizeBaseCanvas if mouse was not already down', () => {
        service['mouseDown'] = false;
        const resizeBaseCanvasSpy = spyOn<any>(service, 'resizeBaseCanvas').and.callThrough();
        service.onMouseUp();
        expect(resizeBaseCanvasSpy).not.toHaveBeenCalled();
    });
    it(' mouseDown should set lastPosition to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service['lastPosition']).toEqual(expectedResult);
    });
    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service['mouseDown']).toEqual(true);
    });
    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service['mouseDown']).toEqual(false);
    });
    it(' onMouseMove should call resizeResizingLayer if mouse was already down', () => {
        service['lastPosition'] = { x: 0, y: 0 };
        service['mouseDown'] = true;
        const resizeResizingLayerSpy = spyOn<any>(service, 'resizeResizingLayer').and.callThrough();
        service.onMouseMove(mouseEvent);
        expect(resizeResizingLayerSpy).toHaveBeenCalled();
    });
    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service['lastPosition'] = { x: 0, y: 0 };
        service['mouseDown'] = false;
        const resizeResizingLayerSpy = spyOn<any>(service, 'resizeResizingLayer').and.callThrough();
        service.onMouseMove(mouseEvent);
        expect(resizeResizingLayerSpy).not.toHaveBeenCalled();
    });
    it('getResizingLayerBorderStyle should return the shape solid', () => {
        service.resizerLocation = ResizerLocation.NONE;
        const shape = service.getResizingLayerBorderStyle();
        expect(shape).toEqual('1px solid');
    });
    it('getResizerCanvasBorderStyle should return the shape dotted', () => {
        service.resizerLocation = ResizerLocation.BOTTOM;
        const shape = service.getResizingLayerBorderStyle();
        expect(shape).toEqual('2px dotted');
    });
    it('getResizerStyle should call getRightResizerStyle', () => {
        const getRightResizerStyleSpy = spyOn<any>(service, 'getRightResizerStyle').and.callThrough();
        service.getResizerStyle(ResizerLocation.RIGHT);
        expect(getRightResizerStyleSpy).toHaveBeenCalled();
    });
    it('getResizerStyle should call getCornerResizerStyle', () => {
        const getCornerResizerStyleSpy = spyOn<any>(service, 'getCornerResizerStyle').and.callThrough();
        service.getResizerStyle(ResizerLocation.CORNER);
        expect(getCornerResizerStyleSpy).toHaveBeenCalled();
    });
    it('getResizerStyle should call getBottomResizerStyle', () => {
        const getBottomResizerStyleSpy = spyOn<any>(service, 'getBottomResizerStyle').and.callThrough();
        service.getResizerStyle(ResizerLocation.BOTTOM);
        expect(getBottomResizerStyleSpy).toHaveBeenCalled();
    });
    it('resizeResizingLayer should call resizeRight', () => {
        const resizeRightSpy = spyOn<any>(service, 'resizeRight').and.callThrough();
        service.resizerLocation = ResizerLocation.RIGHT;
        service['resizeResizingLayer'](mouseEvent);
        expect(resizeRightSpy).toHaveBeenCalled();
    });
    it('resizeResizingLayer should call resizeBottom', () => {
        const resizeBottomSpy = spyOn<any>(service, 'resizeBottom').and.callThrough();
        service.resizerLocation = ResizerLocation.BOTTOM;
        service['resizeResizingLayer'](mouseEvent);
        expect(resizeBottomSpy).toHaveBeenCalled();
    });
    it('resizeResizingLayer should call resizeCorner', () => {
        const resizeCornerSpy = spyOn<any>(service, 'resizeCorner').and.callThrough();
        service.resizerLocation = ResizerLocation.CORNER;
        service['resizeResizingLayer'](mouseEvent);
        expect(resizeCornerSpy).toHaveBeenCalled();
    });
    it('resizeResizingLayer should not resize resizingLayer', () => {
        const resizeRightSpy = spyOn<any>(service, 'resizeRight').and.callThrough();
        const resizeBottomSpy = spyOn<any>(service, 'resizeBottom').and.callThrough();
        const resizeCornerSpy = spyOn<any>(service, 'resizeCorner').and.callThrough();
        service.resizerLocation = ResizerLocation.NONE;
        service['resizeResizingLayer'](mouseEvent);
        expect(resizeRightSpy).not.toHaveBeenCalled();
        expect(resizeBottomSpy).not.toHaveBeenCalled();
        expect(resizeCornerSpy).not.toHaveBeenCalled();
    });
    it('resizeRight should change resizingLayer width with new position value', () => {
        const newPosition: Vec2 = { x: 2 * MIN_WIDTH, y: 2 * MIN_HEIGHT };
        service.workSpaceSize = { x: 4 * MIN_WIDTH, y: 4 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const width = MIN_WIDTH + newPosition.x - service['lastPosition'].x;
        service['resizeRight'](newPosition);
        expect(width).toBeGreaterThan(MIN_WIDTH);
        expect(service.resizingLayerSize.x).toEqual(width);
    });
    it('resizeRight should change resizingLayer width MIN_WIDTH', () => {
        const newPosition: Vec2 = { x: -MIN_WIDTH, y: MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const width = MIN_WIDTH + newPosition.x - service['lastPosition'].x;
        service['resizeRight'](newPosition);
        expect(width).toBeLessThan(MIN_WIDTH);
        expect(service.resizingLayerSize.x).not.toEqual(width);
        expect(service.resizingLayerSize.x).toEqual(MIN_WIDTH);
    });

    it('resizeRight should change resizingLayer width with workspace size', () => {
        const newPosition: Vec2 = { x: 3 * MIN_WIDTH, y: 3 * MIN_HEIGHT };
        service.workSpaceSize = { x: 2 * MIN_WIDTH, y: 2 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const width = MIN_WIDTH + newPosition.x - service['lastPosition'].x;
        service['resizeRight'](newPosition);
        expect(width).toBeGreaterThan(MIN_WIDTH);
        expect(width).toBeGreaterThan(2 * MIN_WIDTH);
        expect(service.resizingLayerSize.x).not.toEqual(width);
        expect(service.resizingLayerSize.x).not.toEqual(MIN_WIDTH);
        expect(service.resizingLayerSize.x).toEqual(2 * MIN_WIDTH);
    });
    it('resizeCorner should change resizingLayer width with new position value', () => {
        const newPosition: Vec2 = { x: 2 * MIN_WIDTH, y: 2 * MIN_HEIGHT };
        service.workSpaceSize = { x: 4 * MIN_WIDTH, y: 4 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const width = MIN_WIDTH + newPosition.x - service['lastPosition'].x;
        service['resizeCorner'](newPosition);
        expect(width).toBeGreaterThan(MIN_WIDTH);
        expect(service.resizingLayerSize.x).toEqual(width);
    });
    it('resizeCorner should change resizingLayer width MIN_WIDTH', () => {
        const newPosition: Vec2 = { x: -MIN_WIDTH, y: MIN_HEIGHT };
        service.workSpaceSize = { x: 4 * MIN_WIDTH, y: 4 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const width = MIN_WIDTH + newPosition.x - service['lastPosition'].x;
        service['resizeCorner'](newPosition);
        expect(width).toBeLessThan(MIN_WIDTH);
        expect(service.resizingLayerSize.x).not.toEqual(width);
        expect(service.resizingLayerSize.x).toEqual(MIN_WIDTH);
    });
    it('resizeCorner should change resizingLayer width with workspace size', () => {
        const newPosition: Vec2 = { x: 3 * MIN_WIDTH, y: 3 * MIN_HEIGHT };
        service.workSpaceSize = { x: 2 * MIN_WIDTH, y: 2 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const width = MIN_WIDTH + newPosition.x - service['lastPosition'].x;
        service['resizeCorner'](newPosition);
        expect(width).toBeGreaterThan(MIN_HEIGHT);
        expect(width).toBeGreaterThan(2 * MIN_HEIGHT);
        expect(service.resizingLayerSize.x).not.toEqual(width);
        expect(service.resizingLayerSize.x).not.toEqual(MIN_WIDTH);
        expect(service.resizingLayerSize.x).toEqual(2 * MIN_WIDTH);
    });
    it('resizeCorner should change resizingLayer height with new position value', () => {
        const newPosition: Vec2 = { x: 2 * MIN_WIDTH, y: 2 * MIN_HEIGHT };
        service.workSpaceSize = { x: 4 * MIN_WIDTH, y: 4 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const height = MIN_HEIGHT + newPosition.y - service['lastPosition'].y;
        service['resizeCorner'](newPosition);
        expect(height).toBeGreaterThan(MIN_HEIGHT);
        expect(service.resizingLayerSize.y).toEqual(height);
    });
    it('resizeCorner should change resizingLayer height MIN_HEIGHT', () => {
        const newPosition: Vec2 = { x: MIN_WIDTH, y: -MIN_HEIGHT };
        service.workSpaceSize = { x: 4 * MIN_WIDTH, y: 4 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const height = MIN_HEIGHT + newPosition.y - service['lastPosition'].y;
        service['resizeCorner'](newPosition);
        expect(height).toBeLessThan(MIN_HEIGHT);
        expect(service.resizingLayerSize.y).not.toEqual(height);
        expect(service.resizingLayerSize.y).toEqual(MIN_HEIGHT);
    });
    it('resizeCorner should change resizingLayer height with workspace size', () => {
        const newPosition: Vec2 = { x: 3 * MIN_WIDTH, y: 3 * MIN_HEIGHT };
        service.workSpaceSize = { x: 2 * MIN_WIDTH, y: 2 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const height = MIN_HEIGHT + newPosition.y - service['lastPosition'].y;
        service['resizeCorner'](newPosition);
        expect(height).toBeGreaterThan(MIN_HEIGHT);
        expect(height).toBeGreaterThan(2 * MIN_HEIGHT);
        expect(service.resizingLayerSize.y).not.toEqual(height);
        expect(service.resizingLayerSize.y).not.toEqual(MIN_HEIGHT);
        expect(service.resizingLayerSize.y).toEqual(2 * MIN_HEIGHT);
    });
    it('resizeBottom should change resizingLayer height with new position value', () => {
        const newPosition: Vec2 = { x: 2 * MIN_WIDTH, y: 2 * MIN_HEIGHT };
        service.workSpaceSize = { x: 4 * MIN_WIDTH, y: 4 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const height = MIN_HEIGHT + newPosition.y - service['lastPosition'].y;
        service['resizeBottom'](newPosition);
        expect(height).toBeGreaterThan(MIN_HEIGHT);
        expect(service.resizingLayerSize.y).toEqual(height);
    });
    it('resizeBottom should change resizingLayer height MIN_HEIGHT', () => {
        const newPosition: Vec2 = { x: MIN_WIDTH, y: -MIN_HEIGHT };
        service.workSpaceSize = { x: 4 * MIN_WIDTH, y: 4 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const height = MIN_HEIGHT + newPosition.y - service['lastPosition'].y;
        service['resizeBottom'](newPosition);
        expect(height).toBeLessThan(MIN_HEIGHT);
        expect(service.resizingLayerSize.y).not.toEqual(height);
        expect(service.resizingLayerSize.y).toEqual(MIN_HEIGHT);
    });
    it('resizeBottom should change resizingLayer height with workspace size', () => {
        const newPosition: Vec2 = { x: 3 * MIN_WIDTH, y: 3 * MIN_HEIGHT };
        service.workSpaceSize = { x: 2 * MIN_WIDTH, y: 2 * MIN_HEIGHT };
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const height = MIN_HEIGHT + newPosition.y - service['lastPosition'].y;
        service['resizeBottom'](newPosition);
        expect(height).toBeGreaterThan(MIN_HEIGHT);
        expect(height).toBeGreaterThan(2 * MIN_HEIGHT);
        expect(service.resizingLayerSize.y).not.toEqual(height);
        expect(service.resizingLayerSize.y).not.toEqual(MIN_HEIGHT);
        expect(service.resizingLayerSize.y).toEqual(2 * MIN_HEIGHT);
    });
    it('getRightResizerStyle should change top and left with resizingLayerSize value', () => {
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const top = MIN_HEIGHT / 2 - PHYSICAL_RESIZER_DIMENSIONS / 2 + 'px';
        const left = MIN_WIDTH - 1 / 2 + 'px';
        const expectedValue = `left: ${left}; top: ${top}; width: ${PHYSICAL_RESIZER_DIMENSIONS + 'px'}; height: ${
            PHYSICAL_RESIZER_DIMENSIONS + 'px'
        }; cursor: ew-resize`;
        const style = service['getRightResizerStyle']();
        expect(style).toEqual(expectedValue);
    });
    it('getBottomResizerStyle should change top and left with resizingLayerSize value', () => {
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const top = MIN_HEIGHT - 1 / 2 + 'px';
        const left = MIN_WIDTH / 2 - PHYSICAL_RESIZER_DIMENSIONS / 2 + 'px';
        const expectedValue = `left: ${left}; top: ${top}; width: ${PHYSICAL_RESIZER_DIMENSIONS + 'px'}; height: ${
            PHYSICAL_RESIZER_DIMENSIONS + 'px'
        }; cursor: ns-resize`;
        const style = service['getBottomResizerStyle']();
        expect(style).toEqual(expectedValue);
    });
    it('getCornerResizerStyle should change top and left with the right values', () => {
        service.resizingLayerSize = { x: MIN_WIDTH, y: MIN_HEIGHT };
        const top = '249px';
        const left = '249px';
        const expectedValue = `left: ${left}; top: ${top}; width: ${PHYSICAL_RESIZER_DIMENSIONS + 'px'}; height: ${
            PHYSICAL_RESIZER_DIMENSIONS + 'px'
        }; cursor: nwse-resize`;
        const style = service['getCornerResizerStyle']();
        expect(style).toEqual(expectedValue);
    });
    it('should update canvas data', () => {
        const spy = spyOn(drawingServiceSpy.baseCtx, 'putImageData');
        const resizer: ResizeAttributes = {
            name: 'resizer',
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
            canvasSize: { x: 400, y: 650 },
            imageData: drawingServiceSpy.baseCtx.getImageData(0, 0, 100, 100),
        };
        service.updateCanvasData(resizer);
        expect(service.resizingLayerSize).toEqual(resizer.canvasSize);
        expect(spy).toHaveBeenCalled();
    });
});
