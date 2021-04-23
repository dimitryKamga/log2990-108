import { TestBed } from '@angular/core/testing';
import { Angles, Quad } from '@app/classes/enums/draw-enums';
import { TrigonometryService } from './trigonometry.service';

describe('TrigonometryService', () => {
    let service: TrigonometryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TrigonometryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should calculate the quad of the cursor position if both opp and cont superior to 1', () => {
        const contiguous = 1;
        const opposite = 1;
        const spyOn: Quad = service.calculateCursorQuad(contiguous, opposite);
        expect(spyOn).toEqual(Quad.TOP_RIGHT);
    });

    it('should calculate the quad of the cursor position if contiguous is inferior to 1', () => {
        const contiguous = -1;
        const opposite = 0;
        const spyOn: Quad = service.calculateCursorQuad(contiguous, opposite);
        expect(spyOn).toEqual(Quad.TOP_LEFT);
    });

    it('should calculate the quad of the cursor position if both contiguous and opposite inferior to 1', () => {
        const contiguous = -1;
        const opposite = -1;
        const spyOn: Quad = service.calculateCursorQuad(contiguous, opposite);
        expect(spyOn).toEqual(Quad.BOTTOM_LEFT);
    });

    it('should calculate the quad of the cursor position if opposite inferior to 1', () => {
        const contiguous = 1;
        const opposite = -1;
        const spyOn: Quad = service.calculateCursorQuad(contiguous, opposite);
        expect(spyOn).toEqual(Quad.BOTTOM_RIGHT);
    });

    it('should calculate the quad TOP_RIGHT if angle is superior to 0', () => {
        const angle = 1;
        const spyOn: Angles = service.calculateQuadTopRight(angle);
        expect(spyOn).toEqual(Angles._0);
    });

    it('should calculate the quad TOP_RIGHT if angle is superior to 23', () => {
        const angle = 25;
        const spyOn: Angles = service.calculateQuadTopRight(angle);
        expect(spyOn).toEqual(Angles._45);
    });

    it('should calculate the quad TOP_RIGHT if angle is superior to 68', () => {
        const angle = 80;
        const spyOn: Angles = service.calculateQuadTopRight(angle);
        expect(spyOn).toEqual(Angles._90);
    });

    it('should calculate the quad TOP_LEFT if angle is superior to 90', () => {
        const angle = 95;
        const spyOn: Angles = service.calculateQuadTopLeft(angle);
        expect(spyOn).toEqual(Angles._180);
    });

    it('should calculate the quad TOP_LEFT if angle is superior to 90', () => {
        const angle = 78;
        const spyOn: Angles = service.calculateQuadTopLeft(angle);
        expect(spyOn).toEqual(Angles._90);
    });

    it('should calculate the quad TOP_LEFT if angle is inferior or equal to 22.5', () => {
        const angle = 22.5;
        const spyOn: Angles = service.calculateQuadTopLeft(angle);
        expect(spyOn).toEqual(Angles._135);
    });

    it('should calculate the quad TOP_LEFT if angle is equal to 0', () => {
        const angle = 0;
        const spyOn: Angles = service.calculateQuadTopLeft(angle);
        expect(spyOn).toEqual(Angles._180);
    });

    it('should calculate the quad BOTTOM_LEFT if angle is equal to 0', () => {
        const angle = 0;
        const spyOn: Angles = service.calculateQuadBottomLeft(angle);
        expect(spyOn).toEqual(Angles._180);
    });

    it('should calculate the quad BOTTOM_LEFT if angle is inferior to 67.5', () => {
        const angle = 23;
        const spyOn: Angles = service.calculateQuadBottomLeft(angle);
        expect(spyOn).toEqual(Angles._225);
    });

    it('should calculate the quad BOTTOM_LEFT if angle is superior to 67.5', () => {
        const angle = 80;
        const spyOn: Angles = service.calculateQuadBottomLeft(angle);
        expect(spyOn).toEqual(Angles._270);
    });

    it('should calculate the quad BOTTOM_RIGHT if angle is superior to 67.5', () => {
        const angle = 80;
        const spyOn: Angles = service.calculateQuadBottomRight(angle);
        expect(spyOn).toEqual(Angles._270);
    });

    it('should calculate the quad BOTTOM_RIGHT if angle is superior to 22.5', () => {
        const angle = 22.5;
        const spyOn: Angles = service.calculateQuadBottomRight(angle);
        expect(spyOn).toEqual(Angles._315);
    });

    it('should calculate the quad BOTTOM_RIGHT if angle is superior to 22.5', () => {
        const angle = 0;
        const spyOn: Angles = service.calculateQuadBottomRight(angle);
        expect(spyOn).toEqual(Angles._0);
    });

    it('should calculate PolygonAngle', () => {
        const a = 3;
        const angle = Math.PI / a;
        const sides = 3;
        const spyOn = service.calculatePolygonAngle(sides);
        expect(spyOn).toEqual(angle);
    });

    it('should calculate PolygonCornerWidth', () => {
        const thickness = 10;
        const a = 6;
        const angle = Math.PI / a;
        const width = thickness / Math.sin(angle);
        const sides = 3;
        const spyOn = service.calculatePolygonCornerWidth(sides, thickness);
        expect(spyOn).toEqual(width);
    });
});
