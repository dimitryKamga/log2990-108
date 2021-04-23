import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ModalService } from '@app/services/modals/modal.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('ModalService', () => {
    let service: ModalService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasBlank', 'clearCanvas']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            imports: [MatDialogModule, NoopAnimationsModule, MatSnackBarModule, HttpClientModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    }));

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ModalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call correctly a new drawing modal', () => {
        const spy = spyOn(service['dialog'], 'open').and.callThrough();
        service.newDrawing();
        expect(spy).toHaveBeenCalled();
    });

    it('should call not call correctly a new drawing modal', () => {
        drawingServiceSpy.isCanvasBlank.and.returnValue(true);
        const spySnack = spyOn(service['snack'], 'open');
        service.newDrawing();
        expect(spySnack).toHaveBeenCalledWith('Dessin Vide , Veuillez Dessiner.', '', { duration: 2000, panelClass: ['warning'] });
    });

    it('should call correctly a export modal ', () => {
        const spy = spyOn(service['dialog'], 'open').and.callThrough();
        service.openExportModal();
        expect(spy).toHaveBeenCalled();
    });

    it('should call not call correctly export modal', () => {
        drawingServiceSpy.isCanvasBlank.and.returnValue(true);
        const spySnack = spyOn(service['snack'], 'open');
        service.openExportModal();
        expect(spySnack).toHaveBeenCalledWith('Dessin Vide , Veuillez Dessiner.', '', { duration: 2000, panelClass: ['warning'] });
    });

    it('should call correctly a save modal ', () => {
        const spy = spyOn(service['dialog'], 'open').and.callThrough();
        service.openSavingModal();
        expect(spy).toHaveBeenCalled();
    });

    it('should call not call correctly save modal', () => {
        drawingServiceSpy.isCanvasBlank.and.returnValue(true);
        const spySnack = spyOn(service['snack'], 'open');
        service.openSavingModal();
        expect(spySnack).toHaveBeenCalledWith('Dessin Vide , Veuillez Dessiner.', '', { duration: 2000, panelClass: ['warning'] });
    });

    it('should call correctly carrousel modal ', () => {
        const spy = spyOn(service['dialog'], 'open').and.callThrough();
        service.openCarrouselModal();
        expect(spy).toHaveBeenCalled();
    });
});
