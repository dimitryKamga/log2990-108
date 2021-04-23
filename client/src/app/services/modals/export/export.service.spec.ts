import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ExportFilters, ExportFormats, ExportModes } from '@app/classes/enums/export-enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { ExportService } from '@app/services/modals/export/export.service';
import { Subject } from 'rxjs';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('ExportService', () => {
    let service: ExportService;
    let drawingStub: DrawingService;

    let indexServiceSpy: jasmine.SpyObj<IndexService>;
    let returnObservable: Subject<string>;

    beforeEach(() => {
        drawingStub = new DrawingService();
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['uploadDrawing']);
        returnObservable = new Subject<string>();

        indexServiceSpy.uploadDrawing.and.returnValue(returnObservable.asObservable());

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule, BrowserAnimationsModule],

            providers: [
                { provide: DrawingService, useValue: drawingStub },
                { provide: IndexService, useValue: indexServiceSpy },
            ],
        });
        service = TestBed.inject(ExportService);
        drawingStub.canvas = new CanvasTestHelper().canvas;
        service['drawingService'].canvas = drawingStub.canvas;
        service['drawingService'].baseCtx = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        service.urlImage = new Image();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('checkTitle should set valid title', () => {
        service.checkTitle('title');
        expect(service['isTitleValid'].value).toEqual(true);
    });

    it('checkTitle should not set invalid title', () => {
        service.checkTitle('2');
        expect(service['isTitleValid'].value).toEqual(false);
    });
    it('should export PNG image', () => {
        const spyAttribute = spyOn(service['link'], 'setAttribute');
        const spyClick = spyOn(service['link'], 'click');
        service['currentFormat'].next(ExportFormats.PNG);
        service['currentFilter'].next(ExportFilters.SEPIA);
        service['currentExportMode'].next(ExportModes.EXPORTER);
        service.export('title');
        expect(spyAttribute).toHaveBeenCalled();
        expect(spyClick).toHaveBeenCalled();
    });
    it('should export JPG image ', () => {
        const spyAttribute = spyOn(service['link'], 'setAttribute');
        const spyClick = spyOn(service['link'], 'click');
        service['currentFormat'].next(ExportFormats.JPEG);
        service['currentFilter'].next(ExportFilters.SEPIA);
        service['currentExportMode'].next(ExportModes.EXPORTER);
        service.export('title');
        expect(spyAttribute).toHaveBeenCalled();
        expect(spyClick).toHaveBeenCalled();
    });
    it('should apply a defined filter ', () => {
        service['currentFilter'].next(ExportFilters.SEPIA);
        service.applyFilter();
        expect(service['drawingService'].baseCtx.globalCompositeOperation).toEqual('source-over');
        expect(service['drawingService'].baseCtx.fillStyle).toEqual('#000000');
    });
    it('should not apply a defined filter ', () => {
        service['currentFilter'].next((undefined as unknown) as ExportFilters);
        service.applyFilter();
        expect(service['drawingService'].baseCtx.globalCompositeOperation).toEqual('source-over');
        expect(service['drawingService'].baseCtx.fillStyle).toEqual('#000000');
    });

    it('should be ok on postDrawing', () => {
        service['currentFilter'].next(ExportFilters.AUCUN);
        service['currentFormat'].next(ExportFormats.PNG);
        service.imgurResponse = 'https:i.imgur.comyLbhdDr.jpg';

        const actionFuncReturn = () => {
            return {
                subscribe: (f: () => void) => {
                    f();
                },
            };
        };

        spyOn(service['snack'], 'open').and.returnValue({
            onAction: actionFuncReturn,
        } as any);

        const spy = spyOn<any>(service, 'copyLink');

        const response = '{"data":{"id":"yLbhdDr","name":"asda","link":"https:i.imgur.comyLbhdDr.jpg"},"success":true,"status":200}';

        service.upload('test');
        returnObservable.next(response);
        expect(spy).toHaveBeenCalled();
    });

    it('should show error sendDrawing', () => {
        service['currentFilter'].next(ExportFilters.AUCUN);
        service['currentFormat'].next(ExportFormats.JPEG);
        const spySnack = spyOn(service['snack'], 'open').and.returnValue({} as MatSnackBarRef<TextOnlySnackBar>);

        service.upload('test');
        returnObservable.error('Error');
        expect(spySnack).toHaveBeenCalledWith("Image n'a pas pu être téléversé ", '', { duration: 3000, panelClass: ['warning'] });
    });

    it('should copy link on clipboard', () => {
        const spy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject());
        service['copyLink']();
        expect(spy).toHaveBeenCalled();
    });
});
