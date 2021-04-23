import { TestBed } from '@angular/core/testing';
import { Angles, Quad } from '@app/classes/enums/draw-enums';
import { LineVariables } from '@app/classes/interfaces/line-interfaces';
import { LineAttributes } from '@app/classes/interfaces/tools-attributes';
import { LineFunctionsService } from './line-functions.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
describe('LineFunctionsService', () => {
    let service: LineFunctionsService;
    let lineVariables: LineVariables;
    let lineVariables2: LineVariables;
    let lineAttributes: LineAttributes;
    let baseCtxStub: CanvasRenderingContext2D;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LineFunctionsService);
        const canvas = document.createElement('canvas');
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        lineAttributes = {
            name: 'line',
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [
                { x: 5, y: 7 },
                { x: 9, y: 0 },
            ],
            isJunction: true,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: true,
            savedSegment: [{ firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } }],
            dotRadius: 1,
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
            hypothenuse: 0,
            radians: 1,
        };
        lineVariables2 = {
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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should calculate the closest angle on TOP RIGHT', () => {
        const quad = Quad.TOP_RIGHT;
        lineVariables.quad = quad;
        const spyOn = service.calculateClosestAngle(lineVariables);
        expect(spyOn).toEqual(Angles._0);
    });

    it('should calculate the closest angle on TOP LEFT', () => {
        const quad = Quad.TOP_LEFT;
        lineVariables.quad = quad;
        const spyOn = service.calculateClosestAngle(lineVariables);
        expect(spyOn).toEqual(Angles._135);
    });

    it('should calculate the closest angle on BOTTOM LEFT', () => {
        const quad = Quad.BOTTOM_LEFT;
        lineVariables.quad = quad;
        const spyOn = service.calculateClosestAngle(lineVariables);
        expect(spyOn).toEqual(Angles._180);
    });

    it('should calculate the closest angle on BOTTOM LEFT', () => {
        const quad = Quad.BOTTOM_RIGHT;
        lineVariables.quad = quad;
        const spyOn = service.calculateClosestAngle(lineVariables);
        expect(spyOn).toEqual(Angles._315);
    });

    it('should calculate rotation angle at 0 degrees ', () => {
        const value = { x: 5, y: 1 };
        const gradient = Angles._0;
        lineVariables.gradient = gradient;
        const spyOn = service.rotateAngle(lineVariables);
        expect(spyOn).toEqual(value);
    });

    it('should calculate rotation angle at 45 degrees ', () => {
        const value = { x: 5, y: 0 };
        const gradient = Angles._45;
        lineVariables.gradient = gradient;
        const spyOn = service.rotateAngle(lineVariables);
        expect(spyOn).toEqual(value);
    });

    it('should calculate rotation angle at 90 degrees ', () => {
        const value = { x: 0, y: 6 };
        const gradient = Angles._90;
        lineVariables.gradient = gradient;
        const spyOn = service.rotateAngle(lineVariables);
        expect(spyOn).toEqual(value);
    });

    it('should calculate rotation angle at 135 degrees ', () => {
        const value = { x: 5, y: 0 };
        const gradient = Angles._135;
        lineVariables.gradient = gradient;
        const spyOn = service.rotateAngle(lineVariables);
        expect(spyOn).toEqual(value);
    });

    it('should calculate rotation angle at 180 degrees ', () => {
        const value = { x: 5, y: 1 };
        const gradient = Angles._180;
        lineVariables.gradient = gradient;
        const spyOn = service.rotateAngle(lineVariables);
        expect(spyOn).toEqual(value);
    });

    it('should calculate rotation angle at 225 degrees ', () => {
        const value = { x: 5, y: 2 };
        const gradient = Angles._225;
        lineVariables.gradient = gradient;
        const spyOn = service.rotateAngle(lineVariables);
        expect(spyOn).toEqual(value);
    });

    it('should calculate rotation angle at 270 degrees ', () => {
        const value = { x: 0, y: 6 };
        const gradient = Angles._270;
        lineVariables.gradient = gradient;
        const spyOn = service.rotateAngle(lineVariables);
        expect(spyOn).toEqual(value);
    });

    it('should calculate rotation angle at 315 degrees ', () => {
        const value = { x: 5, y: 2 };
        const gradient = Angles._315;
        lineVariables.gradient = gradient;
        const spyOn = service.rotateAngle(lineVariables);
        expect(spyOn).toEqual(value);
    });

    it('should find hypothenuse ', () => {
        service['findHypothenuse'](lineVariables);
        expect(lineVariables.hypothenuse).not.toEqual(lineVariables2.hypothenuse);
    });

    it('should calculate rotation angle', () => {
        const result = 7;
        const spyOn2 = service.calculateClosestAngle(lineVariables);
        service.calculateRotationAngle(lineVariables.mousePosition, lineVariables, lineAttributes);
        expect(spyOn2).toEqual(result);
    });

    it('should verify if Junction is active', () => {
        service.isJunctionActive(baseCtxStub, lineAttributes);
        expect(lineAttributes.mouseClicks).toEqual([
            { x: 9, y: 0 },
            { x: 9, y: 0 },
        ]);
    });

    it('should verify if Junction is not active', () => {
        lineAttributes.isJunction = false;
        service.isJunctionActive(baseCtxStub, lineAttributes);
        expect(lineAttributes.mouseClicks).not.toEqual([
            { x: 9, y: 0 },
            { x: 9, y: 0 },
        ]);
    });

    it('should verify if it is last point', () => {
        lineAttributes.isLastPoint = false;
        service.isJunctionActive(baseCtxStub, lineAttributes);
        expect(lineAttributes.mouseClicks).not.toEqual([
            { x: 9, y: 0 },
            { x: 9, y: 0 },
        ]);
    });

    it('should verify if it is double clicked', () => {
        lineAttributes.isLastPoint = false;
        lineAttributes.isDoubleClicked = true;
        service.isJunctionActive(baseCtxStub, lineAttributes);
        expect(lineAttributes.mouseClicks).toEqual([
            { x: 5, y: 7 },
            { x: 0, y: 0 },
        ]);
    });
});
