import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ResizerLocation } from '@app/classes/enums/draw-enums';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LoadDrawingService } from '@app/services/drawing/load-drawing/load-drawing.service';
import { WorkSpaceComponent } from './work-space.component';

describe('WorkSpaceComponent', () => {
    let component: WorkSpaceComponent;
    let fixture: ComponentFixture<WorkSpaceComponent>;
    let drawingResizerServiceSpy: jasmine.SpyObj<DrawingResizerService>;
    let loadDrawingServiceSpy: jasmine.SpyObj<LoadDrawingService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        drawingResizerServiceSpy = jasmine.createSpyObj('DrawingResizerService', ['applyCanvasDefaultSize', 'getResizerStyle']);
        loadDrawingServiceSpy = jasmine.createSpyObj('loadDrawingService', ['loadPreviousDrawing']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['getCanvasBaseData', 'setPixelColor', 'canvas']);

        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule],
            declarations: [WorkSpaceComponent],
            providers: [
                { provide: DrawingResizerService, useValue: drawingResizerServiceSpy },
                { provide: LoadDrawingService, useValue: loadDrawingServiceSpy },
                { provide: DrawingService, useValue: drawServiceSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkSpaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        localStorage.setItem('data', '');
        expect(component).toBeTruthy();
    });

    it('should create', () => {
        localStorage.clear();
        expect(component).toBeTruthy();
    });

    it('getResizerStyle should call getResizerStyle of drawingResizerServiceSpy', () => {
        component.getResizerStyle(ResizerLocation.CORNER);
        expect(drawingResizerServiceSpy.getResizerStyle).toHaveBeenCalledWith(ResizerLocation.CORNER);
    });
});
