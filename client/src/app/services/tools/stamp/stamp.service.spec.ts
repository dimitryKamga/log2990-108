import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_ANGLE, DEFAULT_SIZE, FACTOR_5, MAX_ANGLE } from '@app/classes/constants/draw-constants';
import { MouseButton, StampChoiceLabels } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { BehaviorSubject } from 'rxjs';
import { StampService } from './stamp.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('StampService', () => {
    let service: StampService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'baseCtx',
            'clearCanvas',
            'previewCtx',
            'getCanvasBaseData',
            'autoSave',
            'putImageData',
        ]);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        undoRedoPilesSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool', 'handlePiles']);

        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],

            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPilesSpy },
            ],
        });
        service = TestBed.inject(StampService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;

        service.stampAttributes = {
            name: service.name,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
            size: DEFAULT_SIZE,
            pathData: { x: 0, y: 0 },
            angle: new BehaviorSubject(DEFAULT_ANGLE),
            stampChoice: StampChoiceLabels.FIRST_CHOICE,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get stamp size ', () => {
        const size = 5;
        service.setSize(size);
        expect(service.stampAttributes.size).toBe(size);
        expect(service.getSize()).toEqual(size * FACTOR_5);
    });
    it('should set and get stamp choice', () => {
        const choice: StampChoiceLabels = StampChoiceLabels.FIRST_CHOICE;
        service.setStampChoice(choice);
        expect(service.stampAttributes.stampChoice).toBe(choice);
        expect(service.getStampChoice()).toEqual(choice);
    });

    it('should not set and get stamp choice', () => {
        const choice = 'test' as StampChoiceLabels;
        service.setStampChoice(choice);
        expect(service.stampAttributes.stampChoice).not.toBe(StampChoiceLabels.FITH_CHOICE);
        expect(service.getStampChoice()).not.toEqual(StampChoiceLabels.FITH_CHOICE);
    });

    it('should set stamp angle', () => {
        const angle = 45;
        service.setAngle(angle);
        expect(service.stampAttributes.angle.getValue()).toBe(angle);
    });

    it('should set negative  stamp angle', () => {
        const angle = -45;
        service.setAngle(angle);
        expect(service.stampAttributes.angle.getValue()).toBe(angle + MAX_ANGLE);
    });

    it('should change the angle if correct', () => {
        const angle = 45;
        service.setAngle(angle);
        let expectedAngle = 0;
        service.getAngle().subscribe((value: number) => {
            expectedAngle = value;
        });
        expect(expectedAngle).toEqual(angle);
    });

    it('mouseDown should call drawStampIcons', () => {
        const event = {
            button: MouseButton.LEFT,
        } as MouseEvent;

        const spy = spyOn(service, 'drawStampIcon');
        service.mouseDown = true;
        service.onMouseDown(event);
        expect(spy).toHaveBeenCalled();
        expect(undoRedoPilesSpy.handlePiles).toHaveBeenCalled();
    });

    it('mouseUp should call shortcutsenabled true', () => {
        const event = {
            button: MouseButton.RIGHT,
        } as MouseEvent;

        service.onMouseUp(event);
        expect(service['shortcutsHandlerService'].isShortcutKeyEnabled).toBeTrue();
    });

    it('mouseDown should not call drawStampIcons', () => {
        const event = {
            button: MouseButton.RIGHT,
        } as MouseEvent;
        service.mouseDown = false;

        const spy = spyOn(service, 'drawStampIcon');
        service.onMouseDown(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it('mouseMove should call drawStampIcons', () => {
        const event = {} as MouseEvent;
        service.mouseMove = event;
        const spy = spyOn(service, 'drawStampIcon');
        service.onMouseMove(event);
        expect(spy).toHaveBeenCalled();
    });

    it('mouseWheel should call setAngle and mouseMove', () => {
        const event = {} as WheelEvent;
        service.stampForm.patchValue({
            angleFormField: 40,
        });
        const spyAngle = spyOn(service, 'setAngle');
        const spyMouseMove = spyOn(service, 'onMouseMove');

        service.onMouseWheel(event);
        expect(spyAngle).toHaveBeenCalled();
        expect(spyMouseMove).toHaveBeenCalled();
    });

    it('mouseWheel should call setAngle and mouseMove', () => {
        const event = {} as WheelEvent;
        const spyAngle = spyOn(service, 'setAngle');
        const spyMouseMove = spyOn(service, 'onMouseMove');
        service['isAlt'] = true;
        service.onMouseWheel(event);
        expect(spyAngle).toHaveBeenCalled();
        expect(spyMouseMove).toHaveBeenCalled();
    });

    it('should onKeyDown', () => {
        const event: KeyboardEvent = new KeyboardEvent('keydown', { altKey: true });
        service.onKeyDown(event);
        expect(service['isAlt']).toBeTruthy();
    });

    it('should not onKeyDown', () => {
        const event: KeyboardEvent = new KeyboardEvent('keydown', { altKey: false });
        service.onKeyDown(event);
        expect(service['isAlt']).toBeFalsy();
    });

    it('should onKeyUp', () => {
        const event: KeyboardEvent = new KeyboardEvent('keydown', { altKey: false });
        service.onKeyUp(event);
        expect(service['isAlt']).toBeFalsy();
    });

    it('should not onKeyUp', () => {
        const event: KeyboardEvent = new KeyboardEvent('keydown', { altKey: true });
        service.onKeyUp(event);
        expect(service['isAlt']).not.toBeTruthy();
    });

    it('should mouseLeave', () => {
        service.mouseDown = true;

        service.onMouseLeave();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should not mouseLeave', () => {
        service.onMouseLeave();
        service.mouseDown = false;
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(service.mouseDown).toBeFalse();
    });

    it('should draw stamp icons', () => {
        const spy = spyOn(baseCtxStub, 'drawImage');
        service.drawStampIcon(baseCtxStub, service.stampAttributes);
        expect(spy).toHaveBeenCalled();
    });
});
