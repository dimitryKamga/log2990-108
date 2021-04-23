import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MouseButton } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { SprayService } from './spray.service';

// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('SprayService', () => {
    let service: SprayService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;

    let setTimeOutSpy: any;
    let clearTimeoutSpy: any;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'baseCtx',
            'clearCanvas',
            'previewCtx',
            'getCanvasBaseData',
            'putImageData',
            'autoSave',
        ]);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        undoRedoPilesSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool', 'handlePiles']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPilesSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SprayService);
        setTimeOutSpy = spyOn<any>(service, 'setTimeOut').and.callThrough();
        clearTimeoutSpy = spyOn<any>(global, 'clearTimeout').and.callThrough();
        service['drawingService'].baseCtx = baseCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set color', () => {
        service.setColors();
        expect(service.sprayAttributes.mainColor).toBe(colorServiceSpy.primaryColor);
    });

    it('should set jet diamter', () => {
        const numberTest = 1;
        service.setJetDiameter(numberTest);
        expect(service.sprayAttributes.jetDiameter).toBe(numberTest);
    });

    it('should set droplet diamter', () => {
        const numberTest = 1;
        service.setDropletDiameter(numberTest);
        expect(service.sprayAttributes.dropletDiameter).toBe(numberTest);
    });

    it('should set frequency', () => {
        const numberTest = 1;
        service.setFrequency(numberTest);
        expect(service.sprayAttributes.frequency).toBe(numberTest);
    });

    it('should set time out', () => {
        const setTimeoutSpy = spyOn(global, 'setTimeout');
        service['setTimeOut'](service.sprayAttributes);

        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('mouseDown should call set time out', () => {
        const event = {
            button: MouseButton.LEFT,
        } as MouseEvent;

        service.onMouseDown(event);
        expect(setTimeOutSpy).toHaveBeenCalled();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('mouseDown should not  call set time out', () => {
        const event = {} as MouseEvent;

        service.onMouseDown(event);
        expect(setTimeOutSpy).not.toHaveBeenCalled();
        expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it('mouseLeave should call clear time out', () => {
        service.mouseDown = true;
        service.onMouseLeave();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('mouseLeave should not call clear time out', () => {
        service.mouseDown = false;
        service.onMouseLeave();

        expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it('mouseMove should call set time out', () => {
        const onMouseEnterSpy = spyOn(service, 'onMouseEnter');
        const event = {} as MouseEvent;
        service.mouseDown = true;
        service.onMouseMove(event);

        expect(onMouseEnterSpy).toHaveBeenCalled();
    });

    it('mouseMove should not call set time out', () => {
        const onMouseEnterSpy = spyOn(service, 'onMouseEnter');
        const event = {} as MouseEvent;
        service.mouseDown = false;
        service.onMouseMove(event);

        expect(onMouseEnterSpy).toHaveBeenCalled();
    });

    it('mouseUp should call clear time out', () => {
        const event = {} as MouseEvent;
        service.mouseDown = true;
        service.onMouseUp(event);
        expect(undoRedoPilesSpy.setSelectedTool).toHaveBeenCalled();
        expect(drawingServiceSpy.getCanvasBaseData).toHaveBeenCalled();
        expect(drawingServiceSpy.autoSave).toHaveBeenCalled();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('mouseUp should not call clear time out', () => {
        const event = {} as MouseEvent;
        service.mouseDown = false;
        service.onMouseUp(event);
        expect(clearTimeoutSpy).not.toHaveBeenCalled();
    });

    it('should put mousedown to false if event buttons are 0', () => {
        const event = { buttons: 0 } as MouseEvent;
        service.onMouseEnter(event);
        expect(service.mouseDown).toBeFalsy();
    });

    it('should put mousedown to true if event buttons are different than 0', () => {
        service.mouseDown = true;
        const event = { x: 1, y: 1 } as MouseEvent;
        service.onMouseEnter(event);
        expect(service.mouseDown).toBeTruthy();
    });

    it('onDestroy should clear timeout', () => {
        service.ngOnDestroy();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('updateSprayData should update imagedata in attributes', () => {
        const spy = spyOn(drawingServiceSpy.baseCtx, 'putImageData');
        service.updateSprayAttributes(service.sprayAttributes);
        expect(spy).toHaveBeenCalled();
    });
});
