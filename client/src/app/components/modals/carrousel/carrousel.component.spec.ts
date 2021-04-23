import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CarrouselAttributes } from '@app/classes/interfaces/tools-attributes';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { CarrouselService } from '@app/services/modals/carrousel/carrousel.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { MetaData } from '@common/communication/metadata';
import { Subject } from 'rxjs';
import { CarrouselComponent } from './carrousel.component';
import { LoadConfirmationDialogComponent } from './load-confirmation-dialog/load-confirmation-dialog.component';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('CarrouselComponent', () => {
    let component: CarrouselComponent;
    let fixture: ComponentFixture<CarrouselComponent>;
    let dialogRefSpy: MatDialogRef<CarrouselComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let shortcutsHandlerServiceSpy: jasmine.SpyObj<ShortcutsHandlerService>;
    let indexServiceSpy: jasmine.SpyObj<IndexService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let carrouselServiceSpy: jasmine.SpyObj<CarrouselService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let obsData: Subject<MetaData[]>;
    let obsDrawing: Subject<Blob>;
    let carrouselAttributes: CarrouselAttributes;
    let metaData: MetaData;

    beforeEach(async(() => {
        dialogRefSpy = jasmine.createSpyObj('dialogRef', ['close', 'disableClose', 'afterClosed']);
        dialogSpy = jasmine.createSpyObj('dialog', ['open', 'afterClosed', 'closeAll']);
        shortcutsHandlerServiceSpy = jasmine.createSpyObj('ShortcutHandlerService', ['isShortcutKeyEnabled']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['getMetaData', 'getDrawing', 'deleteDrawing']);

        obsData = new Subject<MetaData[]>();
        indexServiceSpy.getMetaData.and.returnValue(obsData.asObservable());

        obsDrawing = new Subject<Blob>();
        indexServiceSpy.getDrawing.and.returnValue(obsDrawing.asObservable());

        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasBlank', 'clearCanvas']);
        carrouselServiceSpy = jasmine.createSpyObj('CarrouselService', ['onPrevious', 'onNext', 'loadImageOnCanvas']);
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

        carrouselAttributes = {
            name: 'carrousel',
            image: 'drawing',
            mainColor: 'white',
            thickness: 1,
            secondaryColor: '',
        };

        TestBed.configureTestingModule({
            declarations: [CarrouselComponent, LoadConfirmationDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: ShortcutsHandlerService, useValue: shortcutsHandlerServiceSpy },
                { provide: IndexService, useValue: indexServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: CarrouselService, useValue: carrouselServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: Router, useValue: routerSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        metaData = { name: 'metaDatas', tags: ['tag', 'tag2'], filename: 'filename', ext: '' };
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarrouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('on destroy should enable shortcut key', () => {
        component.ngOnDestroy();
        expect(shortcutsHandlerServiceSpy.isShortcutKeyEnabled).toEqual(true);
    });

    it('should call onImagePreview ', () => {
        const position = 1;
        component.metasFiltered = [metaData, metaData];
        component.onImagePreview(position);
        expect(position).toEqual(component.indexOfInterest);
    });

    it('onImagePreview should call loadImageOfInterest', () => {
        const spy = spyOn(component, 'loadImageOfInterest');
        const position = 0;
        component.metasFiltered = [metaData, metaData];
        component.onImagePreview(position);
        expect(spy).toHaveBeenCalled();
    });

    it('onImagePreview should call onPrevios', () => {
        const spy = spyOn(component, 'onPrevious');
        const position = 0;
        component.metasFiltered = [metaData];
        component.onImagePreview(position);
        expect(spy).toHaveBeenCalled();
    });

    it('onImagePreview should call onNext', () => {
        const spy = spyOn(component, 'onNext');
        const position = 2;
        component.metasFiltered = [metaData];
        component.onImagePreview(position);
        expect(spy).toHaveBeenCalled();
    });

    it('onImagePreview shoul call loadImageOfInterest if lenght !=2', () => {
        const spy = spyOn(component, 'loadImageOfInterest');
        const position = 1;
        component.metasFiltered = [metaData];
        component.onImagePreview(position);
        expect(spy).toHaveBeenCalled();
    });

    it('onPreviouw should call carrouselService.onPrevious', () => {
        component.onPrevious();
        expect(carrouselServiceSpy.onPrevious).toHaveBeenCalled();
    });

    it('onNext should call carrouselService.onNext', () => {
        component.onNext();
        expect(carrouselServiceSpy.onNext).toHaveBeenCalled();
    });

    it('loadImageOnCanvas should call carrouselService.loadImageOnCanvas', () => {
        const drawing = 'drawing';
        component['loadImageOnCanvas'](drawing);
        expect(carrouselAttributes.image).toEqual(drawing);
        expect(carrouselServiceSpy.loadImageOnCanvas).toHaveBeenCalled();
    });

    it('should move image on left arrow', () => {
        const spy = spyOn(component, 'onPrevious');
        const event = { key: 'ArrowLeft' } as KeyboardEvent;

        component.onKeyDown(event);
        expect(event.key).toEqual('ArrowLeft');
        expect(spy).toHaveBeenCalled();
    });

    it('should move image on right arrow', () => {
        const spy = spyOn(component, 'onNext');
        const event = { key: 'ArrowRight' } as KeyboardEvent;

        component.onKeyDown(event);
        expect(event.key).toEqual('ArrowRight');
        expect(spy).toHaveBeenCalled();
    });

    it('should not move image on invalid event', () => {
        const event = { key: '' } as KeyboardEvent;

        component.onKeyDown(event);
        expect(event.key).toEqual('');
    });

    it('should move image if metasDatabase.length = 2', () => {
        const event = { key: 'ArrowRight' } as KeyboardEvent;
        component.metasDatabase = [metaData, metaData];

        component.onKeyDown(event);
        expect(event.key).toEqual('ArrowRight');
        expect(component.metasDatabase.length).toEqual(2);
    });

    it('should loadTagArray', () => {
        const spy = spyOn(Array, 'isArray');

        component.loadTagArray(metaData);
        expect(spy).toHaveBeenCalled();
    });

    it('applyImageOfInterest should loadImageOnCanvas when click', () => {
        const spy = spyOn<any>(component, 'loadImageOnCanvas');
        component.metasFiltered = [metaData, metaData, metaData];
        const image = new Blob();

        component['applyImageOfInterest'](1);
        obsDrawing.next(image);
        expect(spy).toHaveBeenCalled();
    });

    it('applyImageOfInterest should display messaage error', () => {
        component.metasFiltered = [metaData, metaData, metaData];

        component['applyImageOfInterest'](1);
        obsDrawing.error('Error');
        expect(snackBarSpy.open).toHaveBeenCalledWith("Une erreur est survenue lors du chargement de l'image.", '', {
            duration: 2000,
            panelClass: ['warning'],
        });
    });

    it('should close Carrousel', () => {
        component.closeCarrousel();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('applyImageOfInterest should not load on canavas if path is editor ', () => {
        component.path = '/editor';
        component.metasFiltered = [metaData, metaData, metaData];

        component['applyImageOfInterest'](1);

        expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    });
});
