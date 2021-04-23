import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Angles, MouseButton, Quad } from '@app/classes/enums/draw-enums';
import { LineDraw, LineVariables } from '@app/classes/interfaces/line-interfaces';
import { LineAttributes, Segment } from '@app/classes/interfaces/tools-attributes';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { LineFunctionsService } from '@app/classes/mathematics/line-functions.service';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { LineService } from './line.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('LineService', () => {
    let service: LineService;
    let lineAttributes: LineAttributes;
    let lineVariables: LineVariables;
    let lineDraw: LineDraw;
    let segment: Segment;

    let previewCtxStub: CanvasRenderingContext2D;
    let baseCtxStub: CanvasRenderingContext2D;

    let mouseEvent: MouseEvent;
    let drawDotsSpy: jasmine.Spy<any>;
    let onMouseDoubleClickSpy: jasmine.Spy<any>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let generalFuncSpy: jasmine.SpyObj<GeneralFunctionsService>;
    let lineFuncSpy: jasmine.SpyObj<LineFunctionsService>;
    let undoRedoPileSpy: jasmine.SpyObj<UndoRedoPilesService>;

    const mousePosition: Vec2 = { x: 10, y: 10 };
    const mousePosition2: Vec2 = { x: 11, y: 10 };
    const mousePosition3: Vec2 = { x: 11, y: 11 };

    beforeEach(() => {
        lineAttributes = {
            name: 'line',
            segment: { firstPoint: mousePosition, lastPoint: mousePosition3 },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: true,
            endLine: 'round',
            thickness: 5,
            isDoubleClicked: true,
            isLastPoint: false,
            savedSegment: [{ firstPoint: mousePosition, lastPoint: mousePosition3 }],
            dotRadius: 5,
        };

        lineVariables = {
            angle: 22.5,
            gradient: Angles._315,
            mousePosition: { x: 5, y: 6 },
            contiguous: 1,
            opposite: 1,
            mouseClicks: [
                { x: 5, y: 6 },
                { x: 0, y: 1 },
            ],
            quad: Quad.BOTTOM_RIGHT,
            hypothenuse: 2,
            radians: 1,
        };
        segment = {
            firstPoint: { x: 0, y: 9 },
            lastPoint: { x: 4, y: 6 },
        };

        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        lineFuncSpy = jasmine.createSpyObj('DrawingService', ['rotateAngle', 'calculateRotationAngle', 'isJunctionActive']);
        generalFuncSpy = jasmine.createSpyObj('GeneralFunctionService', ['getDistanceBetweenTwoPoints']);
        undoRedoPileSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool', 'handlePiles']);
        lineDraw = {
            ctx: previewCtxStub,
            thickness: 1,
        };
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: GeneralFunctionsService, useValue: generalFuncSpy },
                { provide: LineFunctionsService, useValue: lineFuncSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPileSpy },
            ],
        });
        service = TestBed.inject(LineService);
        service['nbOfClicks'] = 2;
        service.lineAttributes = lineAttributes;
        service['lineVariables'] = lineVariables;
        service['lineDraw'] = lineDraw;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['undoRedoPiles'].setSelectedTool(true);
        onMouseDoubleClickSpy = spyOn<any>(service, 'onMouseDoubleClick').and.callThrough();
        drawDotsSpy = spyOn<any>(service, 'drawDots').and.callThrough();
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should draw on mouse move', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');

        lineAttributes.isJunction = true;
        service['isDrawing'] = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should draw on mouse move', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        lineAttributes.isJunction = false;
        service['isDrawing'] = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should draw on mouse move', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        lineAttributes.isJunction = false;
        service['isShiftActive'] = true;
        service['isDrawing'] = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should draw on mouse move', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        lineAttributes.isJunction = false;
        service['isShiftActive'] = false;
        service['isDrawing'] = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });
    it('should draw on mouse down same position', () => {
        service['mouseTransition'] = { x: 25, y: 25 };
        service.lineAttributes.mouseClicks.push(mousePosition);
        service.lineAttributes.mouseClicks.push(mousePosition);
        service.onMouseDown(mouseEvent);
        expect(onMouseDoubleClickSpy).toHaveBeenCalled();
    });

    it('should draw on mouse down with double clicked at true', () => {
        service['nbOfClicks'] = 1;
        service.onMouseDown(mouseEvent);
        expect(onMouseDoubleClickSpy).not.toHaveBeenCalled();
    });

    it('should draw on mouse down ', () => {
        service.onMouseDown(mouseEvent);
        expect(undoRedoPileSpy.setSelectedTool).toHaveBeenCalled();
    });

    it('should draw on mouse down with double click at false', () => {
        service['lastPosition'] = mousePosition3;
        service.lineAttributes.isDoubleClicked = false;
        service.lineAttributes.mouseClicks.push(mousePosition2);
        service.lineAttributes.mouseClicks.push(mousePosition3);
        service.onMouseDown(mouseEvent);
        expect(lineAttributes.isDoubleClicked).toBe(false);
    });

    it('should not draw on mouse down', () => {
        const event: MouseEvent = {
            offsetX: 20,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        service.onMouseDown(event);
        expect(onMouseDoubleClickSpy).not.toHaveBeenCalled();
    });

    it('should remove segment for each segment', () => {
        service['lastPosition'] = mousePosition3;
        service.lineAttributes.savedSegment.push(segment);
        service.lineAttributes.mouseClicks.push(mousePosition, mousePosition2);
        service['removeLastLine'](service.lineAttributes);
        service.lineAttributes.savedSegment.forEach((s) => {
            expect(s).not.toBeUndefined();
        });
    });

    it('should draw on mouse down nbclicks', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        service['isDrawing'] = true;
        service['drawSegment'](service.lineAttributes);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should draw on mouse down nbclicks', () => {
        service['isDrawing'] = false;
        service['drawSegment'](service.lineAttributes);
        expect(drawDotsSpy).not.toHaveBeenCalled();
    });

    it('should draw on mouse down nbclicks', () => {
        service.lineAttributes.isDoubleClicked = true;
        lineAttributes.mouseClicks.push({ x: 8, y: 9 }, { x: 8, y: 9 });
        service['onMouseDoubleClick']();
        expect(lineAttributes.isLastPoint).toBe(false);
    });

    it('drawLineWithJunctions should verify if JunctionActive', () => {
        const vec1 = { x: 0, y: 0 };
        const vec2 = { x: 5, y: 0 };
        service.lineAttributes.savedSegment.push({ firstPoint: vec1, lastPoint: vec2 });
        service.lineAttributes.mouseClicks.push(vec1, vec2);
        service['drawLineWithJunctions'](baseCtxStub, lineAttributes);
        expect(service.lineAttributes.mouseClicks[service.lineAttributes.mouseClicks.length - 1]).not.toEqual(vec1);
    });

    it('should be a pixel on base canvas in the dot radius ', () => {
        const click1: Vec2 = { x: 0, y: 0 };
        const click2: Vec2 = { x: 5, y: 0 };
        service.lineAttributes.mouseClicks.push(click1);
        service.lineAttributes.mouseClicks.push(click2);
        service['drawDots'](5, baseCtxStub);
        const image: ImageData = baseCtxStub.getImageData(5, 1, 1, 1);
        expect(image.data[0]).toEqual(0);
        expect(image.data[1]).toEqual(0);
        expect(image.data[2]).toEqual(0);
        expect(image.data[3]).toEqual(0);
    });

    it('should be a pixel on base canvas in the dot radius ', () => {
        const vec1: Vec2 = { x: 0, y: 0 };
        const vec2: Vec2 = { x: 5, y: 0 };
        service.lineAttributes.mouseClicks.push(vec1);
        service.lineAttributes.mouseClicks.push(vec2);
        service.lineAttributes.isDoubleClicked = false;
        service['drawDots'](5, baseCtxStub);
        const image: ImageData = baseCtxStub.getImageData(5, 1, 1, 1);
        expect(image.data[0]).toEqual(0);
        expect(image.data[1]).toEqual(0);
        expect(image.data[2]).toEqual(0);
        expect(image.data[3]).not.toEqual(0);
    });

    it('should empty saved segment on Mouse leave ', () => {
        service['isDrawing'] = true;
        service['onMouseLeave']();
        expect(service.lineAttributes.mouseClicks).toEqual([]);
    });

    it('should empty saved segment on Mouse leave ', () => {
        const vec1 = { x: 0, y: 0 };
        const vec2 = { x: 5, y: 0 };
        service['isDrawing'] = false;
        service.lineAttributes.mouseClicks.push(vec1, vec2);
        service['onMouseLeave']();
        expect(service.lineAttributes.savedSegment).not.toEqual([]);
        expect(service.lineAttributes.mouseClicks).not.toEqual([]);
    });

    it('should get the distance of the last clicks ', () => {
        service.lineAttributes.mouseClicks.push(mousePosition, mousePosition2);
        service['generalFunctions'].getDistanceBetweenTwoPoints = jasmine.createSpy().and.returnValue(1);
        service['getDistancePoints'](service.lineAttributes, 2);
        expect(lineAttributes.isLastPoint).toBe(true);
    });

    it('should get the distance of the last clicks ', () => {
        const value = 23;
        service.lineAttributes.mouseClicks.push(mousePosition, mousePosition2);
        service['generalFunctions'].getDistanceBetweenTwoPoints = jasmine.createSpy().and.returnValue(value);
        service['getDistancePoints'](service.lineAttributes, 2);
        expect(lineAttributes.isLastPoint).toBe(false);
    });

    it('should not draw junctions if isJunction is false  ', () => {
        service['isDrawing'] = true;
        service.lineAttributes.isJunction = false;
        service['lastPosition'] = mousePosition2;
        service.lineAttributes.mouseClicks.push(mousePosition, mousePosition2);
        service['drawSegment'](lineAttributes);
        expect(lineAttributes.isLastPoint).toBe(false);
    });
});
