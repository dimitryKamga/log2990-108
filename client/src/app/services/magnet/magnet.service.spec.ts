import { TestBed } from '@angular/core/testing';
import { MagnetService } from './magnet.service';

describe('MagnetService', () => {
    let service: MagnetService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MagnetService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should enable magnet', () => {
        service.enableMagnet(true);
        expect(service.isEnabled).toBe(true);
    });

    it('should return nearest point', () => {
        const point = { x: 5, y: 5 };
        expect(service.nearestIntersection(point).x).toEqual(0);
        expect(service.nearestIntersection(point).y).toEqual(0);
    });

    it('should set magnet', () => {
        service.isEnabled = false;
        service.setMagnet();
        expect(service.isEnabled).toBe(true);
    });
});
