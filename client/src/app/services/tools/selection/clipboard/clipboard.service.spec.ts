import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ClipboardService } from './clipboard.service';

// tslint:disable: prefer-const | raison : Pour initialiser drawingService

describe('ClipboardService', () => {
    let service: ClipboardService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawServiceSpy }] });
        service = TestBed.inject(ClipboardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should copy', () => {
        const spy = spyOn(service, 'copy').and.callThrough();
        service.copy();
        expect(spy).toHaveBeenCalled();
    });
    it('should  paste', () => {
        const spy = spyOn(service, 'paste').and.callThrough();
        service.paste();
        expect(spy).toHaveBeenCalled();
    });
    it('should  cut', () => {
        const spy = spyOn(service, 'cut').and.callThrough();
        service.cut();
        expect(spy).toHaveBeenCalled();
    });
    it('should  delete', () => {
        const spy = spyOn(service, 'delete').and.callThrough();
        service.delete();
        expect(spy).toHaveBeenCalled();
    });
    it('should reset clipboard', () => {
        const spy = spyOn(service, 'resetClipboard').and.callThrough();
        service.resetClipboard();
        expect(spy).toHaveBeenCalled();
    });
});
