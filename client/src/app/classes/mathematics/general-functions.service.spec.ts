import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { GeneralFunctionsService } from './general-functions.service';

describe('GeneralFunctionsService', () => {
    let service: GeneralFunctionsService;
    const a = { x: 4, y: 0 };
    const b = { x: 9, y: 8 };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GeneralFunctionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should convert any angle in radians in degrees', () => {
        const radians = 1;
        const degrees = 57.29577951308232;
        const spy: number = service.convertInDegrees(radians);
        expect(spy).toEqual(degrees);
    });

    it('should calculate the distance between two points', () => {
        const value = 9.433981132056603;
        const spy = service.getDistanceBetweenTwoPoints(a, b);
        expect(spy).toEqual(value);
    });

    it('should calculate the middle distance between two points', () => {
        const value: Vec2 = { x: 6.5, y: 4 };
        const spy = service.getMiddleBetweenTwoPoints(a, b);
        expect(spy).toEqual(value);
    });

    it('should calculate the middle distance between two points', () => {
        const c = { x: 9, y: 8 };
        const d = { x: 4, y: 0 };
        const value: Vec2 = { x: 1.5, y: -4 };
        const spy = service.getMiddleBetweenTwoPoints(c, d);
        expect(spy).toEqual(value);
    });

    it('should calculate the segment distance', () => {
        const value = true;
        const spy = service.checkSegmentDistance(a, b);
        expect(spy).toEqual(value);
    });

    it('should check if the point is outSide ellipse', () => {
        const spy = service.checkOutsideEllipseSurface(a, b);
        expect(spy).toEqual(false);
    });

    it('should get Shorter side', () => {
        const width = -5;
        const height = 3;
        const spy = service.getShorterSide(width, height);
        expect(spy).toEqual(height);
    });

    it('should get direction', () => {
        const width = -5;
        const direction = -1;
        const spy = service.getDirection(width);
        expect(spy).toEqual(direction);
    });
});
