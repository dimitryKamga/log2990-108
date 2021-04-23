import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { LineAttributes } from '@app/classes/interfaces/tools-attributes';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolCommandService } from './tool-command.service';
import { UndoRedoPilesService } from './undo-redo-piles.service';
import { UndoRedoService } from './undo-redo.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres et fonctions privés

describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPileSpy: jasmine.SpyObj<UndoRedoPilesService>;
    let toolCommandSpy: jasmine.SpyObj<ToolCommandService>;
    let drawingResizerSpy: jasmine.SpyObj<DrawingResizerService>;
    let previewCtxStub: CanvasRenderingContext2D;
    let baseCtxStub: CanvasRenderingContext2D;
    let lineAttributes: jasmine.SpyObj<LineAttributes>;

    let updateActionsSpy: jasmine.Spy<any>;
    let updateUndoPileSpy: jasmine.Spy<any>;
    let updateRedoPileSpy: jasmine.Spy<any>;

    beforeEach(() => {
        const mousePosition: Vec2 = { x: 10, y: 10 };
        const mousePosition3: Vec2 = { x: 11, y: 11 };
        lineAttributes = {
            name: 'line',
            segment: { firstPoint: mousePosition, lastPoint: mousePosition3 },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: true,
            endLine: 'round',
            thickness: 5,
            isDoubleClicked: true,
            isLastPoint: false,
            savedSegment: [{ firstPoint: mousePosition, lastPoint: mousePosition3 }],
            dotRadius: 5,
        };
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        undoRedoPileSpy = jasmine.createSpyObj('UndoRedoPilesService', ['']);
        toolCommandSpy = jasmine.createSpyObj('ToolCommandService', ['executeCommand']);
        drawingResizerSpy = jasmine.createSpyObj('DrawingResizerService', ['resizeBaseCanvas']);
        drawingResizerSpy.canvasSize = { x: 100, y: 200 };
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: ToolCommandService, useValue: toolCommandSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPileSpy },
                { provide: DrawingResizerService, useValue: drawingResizerSpy },
            ],
        });
        service = TestBed.inject(UndoRedoService);
        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        service['undoRedoPiles'].undoPile = [];
        service['undoRedoPiles'].redoPile = [];
        updateActionsSpy = spyOn<any>(service, 'updateActions').and.callThrough();
        updateUndoPileSpy = spyOn<any>(service, 'updateUndoPile').and.callThrough();
        updateRedoPileSpy = spyOn<any>(service, 'updateRedoPile').and.callThrough();
        service['drawingService'] = drawServiceSpy;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previousState = new ImageData(1, 1);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update undo pile ', () => {
        service['undoRedoPiles'].undoPile.push(lineAttributes);
        service['updateUndoPile']();
        service['undoRedoPiles'].undoPile.forEach((t) => {
            expect(toolCommandSpy.executeCommand).toHaveBeenCalledWith(t);
        });

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should not update undo pile ', () => {
        service['updateUndoPile']();
        service['undoRedoPiles'].undoPile.forEach((t) => {
            expect(t).toBeUndefined();
        });
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should update redo pile ', () => {
        service['undoRedoPiles'].redoPile.push(lineAttributes);
        service['updateRedoPile']();
        expect(toolCommandSpy.executeCommand).toHaveBeenCalled();
    });

    it('should not update redo pile ', () => {
        service['updateRedoPile']();
        expect(toolCommandSpy.executeCommand).not.toHaveBeenCalled();
    });
    it('should undo the command ', () => {
        service['undoRedoPiles'].undoPile.push(lineAttributes);
        service['undoRedoPiles'].undoPile.push(lineAttributes);
        service.canUndo = true;
        service.undo();
        expect(drawingResizerSpy.resizeBaseCanvas).toHaveBeenCalled();
        expect(updateUndoPileSpy).toHaveBeenCalled();
        expect(updateActionsSpy).toHaveBeenCalled();
    });
    it('should not undo the command ', () => {
        service.canUndo = false;
        service.undo();
        expect(updateUndoPileSpy).not.toHaveBeenCalled();
    });
    it('should redo the command ', () => {
        service['undoRedoPiles'].redoPile.push(lineAttributes);
        service.canRedo = true;
        service.redo();
        expect(updateRedoPileSpy).toHaveBeenCalled();
        expect(updateActionsSpy).toHaveBeenCalled();
    });
    it('should not redo the command ', () => {
        service.canRedo = false;
        service.redo();
        expect(updateRedoPileSpy).not.toHaveBeenCalled();
    });
});
