import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResizerLocation } from '@app/classes/enums/draw-enums';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { SurfaceResizerComponent } from './surface-resizer.component';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('SurfaceResizerComponent', () => {
    let component: SurfaceResizerComponent;
    let fixture: ComponentFixture<SurfaceResizerComponent>;
    let drawingResizerServiceSpy: jasmine.SpyObj<DrawingResizerService>;

    beforeEach(async(() => {
        drawingResizerServiceSpy = jasmine.createSpyObj('DrawingResizerService', ['onMouseDown', 'onMouseMove', 'onMouseUp']);

        TestBed.configureTestingModule({
            declarations: [SurfaceResizerComponent],
            providers: [{ provide: DrawingResizerService, useValue: drawingResizerServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SurfaceResizerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onMouseDown should call onMouseDown of drawingResizerServiceSpy if a resizer is clicked', () => {
        const mouseEvent = {} as MouseEvent;
        component.onMouseDown(mouseEvent);
        expect(drawingResizerServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it('onResizerClick should change resizerLocation of drawingResizerServiceSpy if a resizer is clicked', () => {
        const mouseEvent = {} as MouseEvent;
        component['drawingResizerService'].resizerLocation = ResizerLocation.NONE;
        component.resizerLocation = ResizerLocation.BOTTOM;
        component.onMouseDown(mouseEvent);
        expect(drawingResizerServiceSpy.resizerLocation).toEqual(ResizerLocation.BOTTOM);
    });

    it('onMouseMove should call onMouseMove of drawingResizerServiceSpy', () => {
        const mouseEvent = {} as MouseEvent;
        component.onMouseMove(mouseEvent);
        expect(drawingResizerServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it('onMouseUp should call onMouseUp of drawingResizerServiceSpy', () => {
        component.onMouseUp();
        expect(drawingResizerServiceSpy.onMouseUp).toHaveBeenCalled();
    });
});
