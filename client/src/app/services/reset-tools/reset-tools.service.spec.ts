import { TestBed } from '@angular/core/testing';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { EyedropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { EllipseService } from '@app/services/tools/shape/ellipse/ellipse.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/shape/rectangle/rectangle.service';
import { SprayService } from '@app/services/tools/spray/spray.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextLogicService } from '@app/services/tools/text/text-logic.service';
import { ResetToolsService } from './reset-tools.service';

describe('ResetToolsService', () => {
    let service: ResetToolsService;
    let lineServiceSpy: jasmine.SpyObj<LineService>;
    let selectRectangleSpy: jasmine.SpyObj<SelectRectangleService>;
    let selectEllipseSpy: jasmine.SpyObj<SelectEllipseService>;
    let pencilServiceSpy: jasmine.SpyObj<PencilService>;
    let polygonServiceSpy: jasmine.SpyObj<PolygonService>;
    let ellipseServiceSpy: jasmine.SpyObj<EllipseService>;
    let rectangleServiceSpy: jasmine.SpyObj<RectangleService>;
    let eraserServiceSpy: jasmine.SpyObj<EraserService>;
    let eyedropperServiceSpy: jasmine.SpyObj<EyedropperService>;
    let sprayServiceSpy: jasmine.SpyObj<SprayService>;
    let textLogicServiceSpy: jasmine.SpyObj<TextLogicService>;
    let stampServiceSpy: jasmine.SpyObj<StampService>;
    let bucketServiceSpy: jasmine.SpyObj<BucketService>;
    let selecLassoSpy: jasmine.SpyObj<SelectLassoService>;

    beforeEach(() => {
        lineServiceSpy = jasmine.createSpyObj('LineService', ['reset']);
        selectRectangleSpy = jasmine.createSpyObj('SelectRectangleService', [
            'initializeAttributes',
            'initializeClipboardAttributes',
            'resetClipboard',
        ]);
        selectEllipseSpy = jasmine.createSpyObj('SelectEllipseService', ['initializeAttributes', 'initializeClipboardAttributes', 'resetClipboard']);
        pencilServiceSpy = jasmine.createSpyObj('PencilService', ['initializeAttributes']);
        polygonServiceSpy = jasmine.createSpyObj('PolygonService', ['initializePolygonAttributes']);
        ellipseServiceSpy = jasmine.createSpyObj('EllipseService', ['initializeEllipseAttributes']);
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', ['initializeRectangleAttributes']);
        eraserServiceSpy = jasmine.createSpyObj('EraserService', ['initializeAttributes']);
        eyedropperServiceSpy = jasmine.createSpyObj('EyedropperService', ['initializeAttributes']);
        sprayServiceSpy = jasmine.createSpyObj('SprayService', ['initializeAttributes']);
        textLogicServiceSpy = jasmine.createSpyObj('TextLogicService', ['reset']);
        stampServiceSpy = jasmine.createSpyObj('StampService', ['initializeAttributes']);
        bucketServiceSpy = jasmine.createSpyObj('BucketService', ['initializeAttributes']);
        selecLassoSpy = jasmine.createSpyObj('SelectLassoService', [
            'initializeAttributes',
            'initializeClipboardAttributes',
            'resetClipboard',
            'initializeLassoUndo',
        ]);

        TestBed.configureTestingModule({
            providers: [
                { provide: PencilService, useValue: pencilServiceSpy },
                { provide: RectangleService, useValue: rectangleServiceSpy },
                { provide: EllipseService, useValue: ellipseServiceSpy },
                { provide: PolygonService, useValue: polygonServiceSpy },
                { provide: LineService, useValue: lineServiceSpy },
                { provide: SelectRectangleService, useValue: selectRectangleSpy },
                { provide: SelectEllipseService, useValue: selectEllipseSpy },
                { provide: EraserService, useValue: eraserServiceSpy },
                { provide: EyedropperService, useValue: eyedropperServiceSpy },
                { provide: SprayService, useValue: sprayServiceSpy },
                { provide: TextLogicService, useValue: textLogicServiceSpy },
                { provide: BucketService, useValue: bucketServiceSpy },
                { provide: StampService, useValue: stampServiceSpy },
                { provide: SelectLassoService, useValue: selecLassoSpy },
            ],
        });
        service = TestBed.inject(ResetToolsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize tool', () => {
        service.initializeTools();
        expect(pencilServiceSpy.initializeAttributes).toHaveBeenCalled();
        expect(selectEllipseSpy.initializeAttributes).toHaveBeenCalled();
        expect(selectRectangleSpy.initializeAttributes).toHaveBeenCalled();
        expect(lineServiceSpy.reset).toHaveBeenCalled();
        expect(eraserServiceSpy.initializeAttributes).toHaveBeenCalled();
        expect(sprayServiceSpy.initializeAttributes).toHaveBeenCalled();
        expect(eyedropperServiceSpy.initializeAttributes).toHaveBeenCalled();
        expect(ellipseServiceSpy.initializeEllipseAttributes).toHaveBeenCalled();
        expect(rectangleServiceSpy.initializeRectangleAttributes).toHaveBeenCalled();
        expect(polygonServiceSpy.initializePolygonAttributes).toHaveBeenCalled();
        expect(textLogicServiceSpy.reset).toHaveBeenCalled();
        expect(stampServiceSpy.initializeAttributes).toHaveBeenCalled();
        expect(selectRectangleSpy.initializeClipboardAttributes).toHaveBeenCalled();
        expect(selectEllipseSpy.initializeClipboardAttributes).toHaveBeenCalled();
        expect(selectRectangleSpy.resetClipboard).toHaveBeenCalled();
        expect(selectEllipseSpy.resetClipboard).toHaveBeenCalled();
        expect(selecLassoSpy.initializeClipboardAttributes).toHaveBeenCalled();
        expect(selecLassoSpy.resetClipboard).toHaveBeenCalled();
        expect(selecLassoSpy.resetClipboard).toHaveBeenCalled();
        expect(selecLassoSpy.initializeLassoUndo).toHaveBeenCalled();
        expect(bucketServiceSpy.initializeAttributes).toHaveBeenCalled();
    });
});
