import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ExportFormats } from '@app/classes/enums/export-enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { Subject } from 'rxjs';
import { SavingService } from './saving.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('SavingService', () => {
    let service: SavingService;
    let indexServiceSpy: jasmine.SpyObj<IndexService>;
    let drawingStub: DrawingService;
    let returnObservable: Subject<void>;

    beforeEach(() => {
        drawingStub = new DrawingService();
        indexServiceSpy = jasmine.createSpyObj('IndexService', ['postDrawing']);
        returnObservable = new Subject<void>();
        indexServiceSpy.postDrawing.and.returnValue(returnObservable.asObservable());
        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatSnackBarModule],
            providers: [
                { provide: DrawingService, useValue: drawingStub },
                { provide: IndexService, useValue: indexServiceSpy },
            ],
        });
        service = TestBed.inject(SavingService);
        drawingStub.canvas = new CanvasTestHelper().canvas;
        service['drawingService'].canvas = drawingStub.canvas;
        service['drawingService'].baseCtx = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('checkTitle should set valid title', () => {
        service.checkTitle('image');
        expect(service['isTitleValid'].value).toEqual(true);
    });

    it('checkTitle should not set invalid title', () => {
        service.checkTitle('####');
        expect(service['isTitleValid'].value).toEqual(false);
    });

    it('should reset subscribers', () => {
        service.resetSubscribers();
        expect(service.currentFormat.value).toEqual(ExportFormats.PNG);
        expect(service['isTitleValid'].value).toEqual(false);
    });

    it('should be ok on postDrawing', async () => {
        const tags = new Set<string>('ABC');
        service['currentFormat'].next(ExportFormats.PNG);
        const spySnack = spyOn(service['snack'], 'open');

        await service.sendDrawing('test', tags);
        returnObservable.next();
        expect(spySnack).toHaveBeenCalledWith('Image correctement sauvegardé', '', { duration: 3000, panelClass: ['save'] });
    });

    it('should show error sendDrawing', async () => {
        const tags = new Set<string>('ABC');
        service['currentFormat'].next(ExportFormats.JPEG);
        const spySnack = spyOn(service['snack'], 'open');

        await service.sendDrawing('test', tags);
        returnObservable.error('Error');
        expect(spySnack).toHaveBeenCalledWith("Image n'a pas pu être sauvegardé ", '', { duration: 3000, panelClass: ['warning'] });
    });
});
