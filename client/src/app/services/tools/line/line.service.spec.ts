import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Angles, Quad } from '@app/classes/enums/draw-enums';
import { LineDraw, LineVariables } from '@app/classes/interfaces/line-interfaces';
import { LineAttributes } from '@app/classes/interfaces/tools-attributes';
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

    let previewCtxStub: CanvasRenderingContext2D;
    let baseCtxStub: CanvasRenderingContext2D;

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

        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        lineFuncSpy = jasmine.createSpyObj('DrawingService', ['rotateAngle', 'calculateRotationAngle', 'isJunctionActive']);
        generalFuncSpy = jasmine.createSpyObj('GeneralFunctionService', ['getDistanceBetweenTwoPoints']);
        undoRedoPileSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool, handlePiles']);
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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update Junction', () => {
        const isJunction = true;
        service.updateJunction(isJunction);
        expect(lineAttributes.isJunction).toBeTruthy();
    });

    it('should update thickness', () => {
        const thickness = 5;
        service.updateThickness(thickness);
        expect(lineAttributes.thickness).toEqual(thickness);
    });

    it('should update dot radius', () => {
        const radius = 5;
        service.updateDotRadius(radius);
        expect(lineAttributes.dotRadius).toEqual(radius);
    });

    it('should reset line', () => {
        service.reset();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should verify double click', () => {
        lineAttributes.mouseClicks.push(mousePosition);
        lineAttributes.mouseClicks.push(mousePosition);
        const result: boolean = service['verifyDoubleClick']();
        expect(result).toBe(true);
    });

    it('should verify double click false', () => {
        lineAttributes.mouseClicks.push(mousePosition);
        lineAttributes.mouseClicks.push(mousePosition2);
        const result: boolean = service['verifyDoubleClick']();
        expect(result).toBe(false);
    });

    it('should verify on shiftkeyDown true', () => {
        const keyboard = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.onKeyDown(keyboard);
        expect(service['isShiftActive']).toBe(true);
    });

    it('should verify on shiftkeyDown false', () => {
        const keyboard = new KeyboardEvent('keypress', {
            key: 'Ctrl',
        });
        service.onKeyDown(keyboard);
        expect(service['isShiftActive']).not.toBe(true);
    });

    it('should verify on onKeyUp Escape', () => {
        const spy = spyOn<any>(service, 'reset');
        const keyboard = new KeyboardEvent('keypress', {
            key: 'Escape',
        });
        service.onKeyUp(keyboard);
        expect(spy).toHaveBeenCalled();
    });

    it('should verify on onKeyUp Backspace', () => {
        const spy = spyOn<any>(service, 'removeLastLine');
        const keyboard = new KeyboardEvent('keypress', {
            key: 'Backspace',
        });
        service.onKeyUp(keyboard);
        expect(spy).toHaveBeenCalled();
    });

    it('should verify on onKeyUp Backspace', () => {
        lineAttributes.mouseClicks.push(mousePosition);
        service['nbOfClicks'] = 1;
        const spy = spyOn<any>(service, 'removeLastLine');
        const keyboard = new KeyboardEvent('keypress', {
            key: 'Backspace',
        });
        service.onKeyUp(keyboard);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should verify on onKeyUp Backspace false', () => {
        service['nbOfClicks'] = 1;
        const spy = spyOn(service, 'onMouseMove');
        const keyboard = new KeyboardEvent('keypress', {
            key: 'Shift',
        });
        service.onKeyUp(keyboard);
        expect(spy).toHaveBeenCalled();
    });

    it('should rotate angle', () => {
        const spy = lineFuncSpy.calculateRotationAngle;
        service['rotateAngle'](mousePosition, lineVariables, lineAttributes);
        expect(spy).toHaveBeenCalled();
    });

    it('should remove segment', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        lineAttributes.isJunction = true;
        lineAttributes.mouseClicks.push(mousePosition);
        service['removeLastLine'](lineAttributes);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('should remove segment with junctions', () => {
        const drawLineSpy = spyOn<any>(service, 'drawLine');
        lineAttributes.isJunction = false;
        service['removeLastLine'](lineAttributes);
        expect(drawLineSpy).toHaveBeenCalled();
    });
});
