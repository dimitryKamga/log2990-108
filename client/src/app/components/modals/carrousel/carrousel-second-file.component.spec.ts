import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MAX_NUMBER_IMAGES } from '@app/classes/constants/draw-constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { CarrouselService } from '@app/services/modals/carrousel/carrousel.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { MetaData } from '@common/communication/metadata';
import { of, Subject } from 'rxjs';
import { CarrouselComponent } from './carrousel.component';
import { LoadConfirmationDialogComponent } from './load-confirmation-dialog/load-confirmation-dialog.component';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable:prefer-const| raison : Pour initialiser un meta data
// tslint:disable: no-unused-expression | raison : Pour utiliser l'observateur sur le getMetasdata

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
    let undoRedoPilesServiceSpy: jasmine.SpyObj<UndoRedoPilesService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let obsData: Subject<MetaData[]>;
    let obsDelete: Subject<string>;
    let metaData: MetaData;

    beforeEach(async(() => {
        dialogRefSpy = jasmine.createSpyObj('dialogRef', ['close', 'disableClose', 'afterClosed']);
        dialogSpy = jasmine.createSpyObj('dialog', ['open', 'closeAll']);
        shortcutsHandlerServiceSpy = jasmine.createSpyObj('ShortcutHandlerService', ['isShortcutKeyEnabled']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['getMetaData', 'getDrawing', 'deleteDrawing']);
        undoRedoPilesServiceSpy = jasmine.createSpyObj('UndoRedoPilesService', ['handlePiles', 'setSelectedTool']);

        obsData = new Subject<MetaData[]>();
        indexServiceSpy.getMetaData.and.returnValue(obsData.asObservable());

        obsDelete = new Subject<string>();
        indexServiceSpy.deleteDrawing.and.returnValue(obsDelete.asObservable());

        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasBlank', 'clearCanvas']);
        carrouselServiceSpy = jasmine.createSpyObj('CarrouselService', ['onPrevious', 'onNext', 'loadImageOnCanvas']);
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

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
                { provide: UndoRedoPilesService, useValue: undoRedoPilesServiceSpy },
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

    it('deleteImage should call getDatabaseData ', () => {
        const spy = spyOn<any>(component, 'getDatabaseData');
        component.imageIndexes.push(1);

        component.metasDatabase = [metaData, metaData, metaData];
        component.deleteImage();
        obsDelete.next();
        expect(spy).toHaveBeenCalled();
    });

    it('deleteImage should display message error', () => {
        component.imageIndexes.push(1);
        component.metasDatabase = [metaData, metaData, metaData];

        component.deleteImage();
        obsDelete.error('Error');
        expect(snackBarSpy.open).toHaveBeenCalledWith("Une erreur est survenue lors de la suppression de l'image", '', {
            duration: 2000,
            panelClass: ['warning'],
        });
    });

    it('deleteImage should assigned hasDrawings at false', () => {
        component.imageIndexes.push(0);
        component.metasDatabase = [metaData, metaData, metaData];
        component.metasFiltered = [];

        component.deleteImage();
        obsDelete.next();
        expect(component.metasFiltered.length).toEqual(0);
        expect(component.hasDrawings).toBeFalse();
    });

    it('should deleteImage if lenght > 1', () => {
        component.imageIndexes.push(0);
        component.metasDatabase = [metaData, metaData, metaData];
        component.metasFiltered = [metaData];

        component.deleteImage();
        obsDelete.next();
        expect(component.metasFiltered.length).not.toEqual(0);
    });

    it('should deleteImage if lenght < 1', () => {
        component.imageIndexes.push(0);
        component.metasDatabase = [metaData];

        component.deleteImage();
        expect(component.metasDatabase.length).not.toEqual(2);
    });

    it('getDrawingsByTags should call previewFilteredImages', () => {
        const spy = spyOn(component, 'previewFilteredImages');
        const tag: string[] = ['tag1', 'tag2', 'tag3'];

        component.imageIndexes.push(0);
        component.metasDatabase = [metaData, metaData, metaData];
        component.metasFiltered = [metaData];

        component.getDrawingsByTags(tag);
        expect(spy).toHaveBeenCalledWith();
    });

    it('getDatabaseData should subscribe getMetaData ', () => {
        const data: MetaData[] = [];
        const spy = spyOn(component, 'previewFilteredImages');

        component['getDatabaseData'];
        obsData.next(data);
        expect(spy).toHaveBeenCalled();
    });

    it('getDatabaseData should show error', () => {
        const data: MetaData[] = [];

        component['getDatabaseData'];
        obsData.error(data);

        expect(snackBarSpy.open).toHaveBeenCalledWith('Une erreur est survenue lors du chargement des images.', '', {
            duration: 7000,
            panelClass: ['warning'],
        });
    });

    it('previewFilteredImages should preview filtered image', () => {
        component.metasFiltered = [metaData, metaData, metaData];
        component.previewFilteredImages();
        expect(component.imageIndexes.length).toEqual(MAX_NUMBER_IMAGES);
    });

    it('should preview filtered image', () => {
        component.metasFiltered = [metaData, metaData, metaData, metaData];

        component.previewFilteredImages();
        expect(component.metasFiltered.length).toBeGreaterThanOrEqual(MAX_NUMBER_IMAGES);
    });

    it('onPreviewTwoDrawings should verify indexOfInterest', () => {
        component.metasFiltered = [metaData];
        component.indexOfInterest = 1;
        component.onPreviewTwoDrawings();
        expect(component.indexOfInterest).toEqual(0);
    });

    it('should apply drawing if canvas is empty', () => {
        drawingServiceSpy.isCanvasBlank.and.returnValue(true);
        const spy = spyOn<any>(component, 'applyImageOfInterest');
        component.loadImageOfInterest(1);
        expect(spy).toHaveBeenCalled();
    });

    it('should not load confirmation dialog if path is honme', () => {
        component.path = '/editor';
        drawingServiceSpy.isCanvasBlank.and.returnValue(false);
        const spy = spyOn<any>(component, 'applyImageOfInterest');
        const loadSpy = dialogSpy.open.and.returnValue({ afterClosed: () => of('close') } as MatDialogRef<LoadConfirmationDialogComponent>);
        component.loadImageOfInterest(1);

        expect(loadSpy).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should apply drawing if canvas is not empty and answer is confirm', () => {
        component.path = '/editor';
        drawingServiceSpy.isCanvasBlank.and.returnValue(false);
        const spy = spyOn<any>(component, 'applyImageOfInterest');
        const loadSpy = dialogSpy.open.and.returnValue({ afterClosed: () => of('confirm') } as MatDialogRef<LoadConfirmationDialogComponent>);
        component.loadImageOfInterest(1);

        expect(loadSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('should not apply drawing if canvas is not empty and answer is close', () => {
        component.path = '/editor';
        drawingServiceSpy.isCanvasBlank.and.returnValue(false);
        const spy = spyOn<any>(component, 'applyImageOfInterest');
        const loadSpy = dialogSpy.open.and.returnValue({ afterClosed: () => of('close') } as MatDialogRef<LoadConfirmationDialogComponent>);
        component.loadImageOfInterest(1);

        expect(loadSpy).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });
});
