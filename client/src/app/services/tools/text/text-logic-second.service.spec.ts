import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_FONT_STYLE, DEFAULT_TEXT_SIZE } from '@app/classes/constants/draw-constants';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { TextLogicService } from './text-logic.service';
import { TextService } from './text.service';

// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('TextLogicService', () => {
    let service: TextLogicService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let textServiceStub: TextService;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let undoRedoPilesSpy: jasmine.SpyObj<UndoRedoPilesService>;
    let shortcutServiceSpy: jasmine.SpyObj<ShortcutsHandlerService>;
    let textServiceSpy: jasmine.SpyObj<TextService>;

    let removeTextSpy: jasmine.Spy<any>;

    beforeEach(() => {
        textServiceStub = new TextService({} as DrawingService, {} as ColorService);
        textServiceSpy = jasmine.createSpyObj('TextService', [
            'getLinePositionAndIndex',
            'moveLineUp',
            'moveLineDown',
            'getLinePosition',
            'isKeyAuthorized',
            'text',
        ]);
        shortcutServiceSpy = jasmine.createSpyObj('ShortcutHandlerService', ['onKeyDown']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getCanvasBaseData', 'putImageData', 'autoSave']);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        undoRedoPilesSpy = jasmine.createSpyObj('UndoRedoPilesService', ['setSelectedTool', 'handlePiles']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: ShortcutsHandlerService, useValue: shortcutServiceSpy },
                { provide: UndoRedoPilesService, useValue: undoRedoPilesSpy },
                { provide: TextService, useValue: textServiceSpy },
                { provide: TextService, useValue: textServiceStub },
            ],
        });
        service = TestBed.inject(TextLogicService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        textServiceStub['drawingService'].baseCtx = baseCtxStub;
        textServiceStub['drawingService'].previewCtx = previewCtxStub;

        textServiceStub['drawingService'].previewCanvas = canvasTestHelper.canvas;

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        textServiceStub.isNewWriting = true;
        textServiceStub.indexPosition = 1;
        removeTextSpy = spyOn<any>(service, 'removeText').and.callThrough();
        textServiceStub.italicStyle = 'normal';
        textServiceStub.boldStyle = 'normal';
        textServiceStub.frontPosition = false;
        textServiceStub.canWrite = true;
        textServiceStub.font = DEFAULT_FONT_STYLE;
        textServiceStub.textSize = DEFAULT_TEXT_SIZE;
        textServiceStub.textAlign = 'start';
        textServiceStub.line = '|';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should call addObjecttoText when letter', () => {
        textServiceStub.isNewWriting = true;
        const spy = spyOn<any>(service, 'addObjecttoText');
        const event = new KeyboardEvent('keydown', { key: 'j' });
        service.onKeyDown(event);
        expect(spy).toHaveBeenCalledWith(event.key);
    });

    it('Should not call addObjecttoText when key not authorized', () => {
        const spy = spyOn<any>(service, 'addObjecttoText');
        const event = new KeyboardEvent('keydown', { key: 'Shift' });
        service.onKeyDown(event);
        expect(spy).not.toHaveBeenCalledWith(event.key);
    });

    it('Should not call addObjecttoText when key authorized but text', () => {
        textServiceStub.isNewWriting = false;
        const spy = spyOn<any>(service, 'addObjecttoText');
        const event = new KeyboardEvent('keydown', { key: 'a' });
        service.onKeyDown(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it('Should call remove text on delete', () => {
        textServiceStub.frontPosition = true;
        textServiceStub.text = ['|', 'a', 'b', 'c', 'Enter', 'd', 'e'];
        textServiceStub.indexPosition = 5;
        const event = new KeyboardEvent('keydown', { key: 'Delete' });
        service.onKeyDown(event);
        expect(textServiceStub.frontPosition).toBeTrue();
        expect(removeTextSpy).toHaveBeenCalled();
    });

    it('Should call remove text on delete', () => {
        textServiceStub.text = [];
        textServiceStub.indexPosition = -1;
        const event = new KeyboardEvent('keydown', { key: 'Delete' });
        service.onKeyDown(event);
        expect(textServiceStub.frontPosition).toBeTrue();
        expect(removeTextSpy).toHaveBeenCalled();
    });

    it('Should call remove text on Backspace when position is inferior to 0', () => {
        textServiceStub.frontPosition = true;
        textServiceStub.text = ['|', 'a', 'b', 'c', 'Enter', 'd', 'e'];
        textServiceStub.indexPosition = 5;
        const event = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.onKeyDown(event);
        expect(removeTextSpy).toHaveBeenCalled();
        expect(textServiceStub.indexPosition).toEqual(4);
    });

    it('Should call remove text on Backspace when position is superior to 0', () => {
        textServiceStub.indexPosition = -1;
        textServiceStub.frontPosition = true;
        textServiceStub.text = ['|', 'a', 'b', 'c', 'Enter', 'd', 'e'];
        const event = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.onKeyDown(event);
        expect(removeTextSpy).toHaveBeenCalled();
        expect(textServiceStub.indexPosition).toEqual(-2);
    });
    it('Should call removeCursorPointer on up ', () => {
        textServiceStub.text = ['a', 'b', 'c', 'Enter', '|'];
        textServiceStub.indexPosition = textServiceStub.text.indexOf('|');

        const spy = spyOn<any>(service, 'addObjecttoText');
        const removeSpy = spyOn<any>(service, 'removeCursorPointer');

        service['moveCursorUpDown']('UP');
        expect(spy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalled();
    });

    it('Should call removeCursorPointer on down', () => {
        textServiceStub.text = ['|', 'a', 'b', 'c', 'Enter', 'd', 'e'];
        textServiceStub.indexPosition = textServiceStub.text.indexOf('|');

        const spy = spyOn<any>(service, 'addObjecttoText');
        const removeSpy = spyOn<any>(service, 'removeCursorPointer');

        service['moveCursorUpDown']('DOWN');
        expect(spy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalled();
    });

    it('Should call removeCursorPointer on down with lastRow', () => {
        textServiceStub.text = ['a', 'b', 'c', 'Enter', '|'];
        textServiceStub.indexPosition = textServiceStub.text.indexOf('|');

        const spy = spyOn<any>(service, 'addObjecttoText');
        const removeSpy = spyOn<any>(service, 'removeCursorPointer').and.callThrough();

        service['moveCursorUpDown']('DOWN');
        expect(spy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalled();
    });

    it('Should call removeCursorPointer on down with lastRow', () => {
        textServiceStub.text = ['a', 'b', '|'];

        textServiceStub.indexPosition = 3;

        service['addObjecttoText']('c');
        expect(textServiceStub.text).toEqual(['a', 'b', 'c', '|']);
    });

    it('removeText should not remove if index is 0 and front position false', () => {
        textServiceStub.frontPosition = false;
        textServiceStub.text = ['a', 'b', 'c', 'd'];
        const text = ['a', 'b', 'c', 'd'];
        service['removeText'](5);
        expect(textServiceStub.text).toEqual(text);
    });

    it('removeText should not remove when inferior to 0', () => {
        textServiceStub.frontPosition = true;
        textServiceStub.text = ['a', 'b', 'c', 'd'];
        const text = ['a', 'b', 'c', 'd'];
        service['removeText'](-1);
        expect(textServiceStub.text).toEqual(text);
    });
});
