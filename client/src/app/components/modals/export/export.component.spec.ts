import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ExportFilters, ExportFormats, ExportModes } from '@app/classes/enums/export-enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/modals/export/export.service';
import { BehaviorSubject } from 'rxjs';
import { ExportComponent } from './export.component';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('ExportComponent', () => {
    let component: ExportComponent;
    let fixture: ComponentFixture<ExportComponent>;

    let drawingStub: DrawingService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    let exportServiceSpy: jasmine.SpyObj<ExportService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ExportComponent>>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasBlank']);
        drawingStub = new DrawingService();
        dialogRefSpy = jasmine.createSpyObj('dialogRef', ['close']);
        exportServiceSpy = jasmine.createSpyObj('ExportService', ['applyFilter', 'resetSubscribers', 'checkTitle', 'export', 'upload']);
        exportServiceSpy.currentFormat = new BehaviorSubject<ExportFormats>(ExportFormats.JPEG);
        exportServiceSpy.currentFilter = new BehaviorSubject<ExportFilters>(ExportFilters.AUCUN);
        exportServiceSpy.currentExportMode = new BehaviorSubject<ExportModes>(ExportModes.EXPORTER);
        exportServiceSpy.isTitleValid = new BehaviorSubject<boolean>(false);
        TestBed.configureTestingModule({
            imports: [MatGridListModule, MatSnackBarModule],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [ExportComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: ExportService, useValue: exportServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
                { provide: DrawingService, useValue: drawingServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        drawingStub.canvas = new CanvasTestHelper().canvas;
        component['drawingService'].canvas = drawingStub.canvas;
        component['exportService'].urlImage = new Image();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' should call resetSubscribers', () => {
        component.resetSubscribers();
        expect(exportServiceSpy.resetSubscribers).toHaveBeenCalled();
    });

    it('setTitle should set a correct title', () => {
        component.setTitle(({
            target: {
                value: 'title',
            } as HTMLInputElement,
        } as unknown) as InputEvent);
        expect(exportServiceSpy.checkTitle).toHaveBeenCalled();
    });

    it('setTitle shoud not set title when target is null', () => {
        component.setTitle(({
            target: null,
        } as unknown) as InputEvent);
        expect(exportServiceSpy.checkTitle).not.toHaveBeenCalled();
    });
    it(' should set a valid filter', () => {
        component.setFilter('SEPIA');
        expect(component['exportService'].currentFilter.value).toEqual(ExportFilters.SEPIA);
        expect(exportServiceSpy.applyFilter).toHaveBeenCalled();
    });

    it(' should not set a filter if get invalid filter', () => {
        component['exportService'].currentFilter.next(ExportFilters.AUCUN);
        component.setFilter(('aaaaa' as unknown) as ExportFilters);
        expect(component['exportService'].currentFilter.value).toEqual(ExportFilters.AUCUN);
        expect(exportServiceSpy.applyFilter).not.toHaveBeenCalled();
    });
    it(' should set a valid format', () => {
        component.setFormat('JPEG');
        expect(component['exportService'].currentFormat.value).toEqual(ExportFormats.JPEG);
    });

    it(' should not set a format if get invalid format', () => {
        component['exportService'].currentFormat.next(ExportFormats.JPEG);
        component.setFormat('none');
        expect(component['exportService'].currentFormat.value).toEqual(ExportFormats.JPEG);
    });

    it(' should set a valid export mode', () => {
        component.setExportMode('EXPORTER');
        expect(component['exportService'].currentExportMode.value).toEqual(ExportModes.EXPORTER);
    });

    it(' should not set an export mode if get invalid export mode', () => {
        component['exportService'].currentExportMode.next(ExportModes.EXPORTER);
        component.setExportMode('none');
        expect(component['exportService'].currentExportMode.value).toEqual(ExportModes.EXPORTER);
    });
    it('exportConfirmation should export if title is valid and export mode is Telechargement', () => {
        component['isTitleValid'] = true;
        component.exportConfirmation();
        expect(exportServiceSpy.export).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
    });
    it('exportConfirmation should export if title is valid and export mode is televerser', () => {
        component['isTitleValid'] = true;
        component.exportMode = ExportModes.TELEVERSER;
        component.exportConfirmation();
        expect(exportServiceSpy.upload).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
    });
    it('exportConfirmation should not export if title is not valid ', () => {
        component['isTitleValid'] = false;
        const spySnackBar = spyOn(component['snack'], 'open');
        component.exportConfirmation();
        expect(spySnackBar).toHaveBeenCalledTimes(1);
    });
});
