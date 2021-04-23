import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_FONT_STYLE, DEFAULT_TEXT_SIZE, MOVE_LEFT } from '@app/classes/constants/draw-constants';
import { KeyValues, MouseButton } from '@app/classes/enums/draw-enums';
import { Vec2 } from '@app/classes/vec2';
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

    let setFontStyleSpy: jasmine.Spy<any>;
    let confirmTextSpy: jasmine.Spy<any>;

    beforeEach(() => {
        textServiceStub = new TextService({} as DrawingService, {} as ColorService);
        textServiceSpy = jasmine.createSpyObj('TextService', [
            'getLinePositionAndIndex',
            'moveCursorUp',
            'moveCursorDown',
            'getLinePosition',
            'isKeyAuthorized',
            'text',
        ]);
        shortcutServiceSpy = jasmine.createSpyObj('ShortcutHandlerService', ['onKeyDown']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'clearCanvas',
            'getCanvasBaseData',
            'putImageData',
            'handlePreviewCanvas',
            'autoSave',
        ]);
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

        setFontStyleSpy = spyOn<any>(service, 'setFontStyle').and.callThrough();
        textServiceStub.isNewWriting = true;
        textServiceStub.indexPosition = 1;
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
    it('should set in ialic', () => {
        service.setItalic(true);
        expect(textServiceStub.italicStyle).toBe('italic');
        expect(setFontStyleSpy).toHaveBeenCalled();
    });
    it('should not set in ialic', () => {
        service.setItalic(false);
        expect(textServiceStub.italicStyle).toBe('normal');
        expect(setFontStyleSpy).toHaveBeenCalled();
    });

    it('should set in bold', () => {
        service.setBold(true);
        expect(textServiceStub.boldStyle).toBe('bold');
        expect(setFontStyleSpy).toHaveBeenCalled();
    });
    it('should not set in bold', () => {
        service.setBold(false);
        expect(textServiceStub.boldStyle).toBe('normal');
        expect(setFontStyleSpy).toHaveBeenCalled();
    });

    it('should set alignment', () => {
        service.setAlignment('center');
        expect(textServiceStub.textAlign).toBe('center');
        expect(setFontStyleSpy).toHaveBeenCalled();
    });

    it('should set size', () => {
        service.setSize(1);
        expect(textServiceStub.textSize).toEqual(1);
        expect(setFontStyleSpy).toHaveBeenCalled();
    });

    it('should start text', () => {
        service['startText']();
        expect(shortcutServiceSpy.isShortcutKeyEnabled).toBeFalse();
        expect(textServiceStub.isNewWriting).toBeTrue();
        expect(setFontStyleSpy).toHaveBeenCalled();
    });

    it('should reset', () => {
        service['reset']();
        expect(shortcutServiceSpy.isShortcutKeyEnabled).toBeTrue();
        expect(textServiceStub.isNewWriting).toBeFalse();
        expect(textServiceStub.indexPosition).toEqual(0);
    });

    it('should start text on mouse down', () => {
        textServiceSpy.initialPoint = { x: 25, y: 25 };
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.RIGHT,
        } as MouseEvent;
        textServiceSpy.isNewWriting = false;
        service.onMouseDown(mouseEvent);
        expect(textServiceSpy.initialPoint).toEqual(service.getPositionFromMouse(mouseEvent));
    });

    it('should start text on mouse down if newWriting is true', () => {
        textServiceSpy.initialPoint = { x: 25, y: 25 };
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
        textServiceSpy.isNewWriting = true;
        service.onMouseDown(mouseEvent);
        expect(textServiceSpy.initialPoint).toEqual(service.getPositionFromMouse(mouseEvent));
    });
    it('should start text on mouse down if newWriting is false', () => {
        const mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.LEFT,
        } as MouseEvent;
        textServiceStub.isNewWriting = false;
        service.onMouseDown(mouseEvent);
        expect(textServiceStub.initialPoint).toEqual(service.getPositionFromMouse(mouseEvent));
    });

    it('Should be true when the position is on the text', () => {
        textServiceStub.lastRow = 'hey World';
        textServiceStub.height = 2;
        textServiceStub.text = ['h', 'e', 'y', ' ', 'W', 'o', 'r', 'l', 'd'];
        const mousePosition: Vec2 = { x: 2, y: 1 };
        expect(service['isCursorOnText'](mousePosition)).toEqual(true);
    });

    it('Should be false when the position is not on the text', () => {
        textServiceStub.lastRow = 'allo World';
        textServiceStub.height = 2;
        textServiceStub.text = ['a', 'l', 'l', 'o', ' ', 'W', 'o', 'r', 'l', 'd'];
        const mousePosition: Vec2 = { x: 2, y: 25 };
        expect(service['isCursorOnText'](mousePosition)).toEqual(false);
    });

    it('should set font style', () => {
        textServiceStub.text = ['a', 'Enter', 'l', 'Enter', ' ', 'Enter', 'W', 'o', 'r', 'l', 'd'];

        let generateTextSpy: jasmine.Spy<any>;
        generateTextSpy = spyOn<any>(service, 'generateText').and.callThrough();
        textServiceStub.textSize = 50;
        textServiceStub.italicStyle = 'normal';
        textServiceStub.boldStyle = 'normal';
        const font = '50px Arial';
        service['colorService'].primaryColor = '#000000';
        textServiceStub.textAlign = 'center';
        textServiceStub.font = 'Arial';

        service.setFontStyle();
        expect(previewCtxStub.font).toEqual(font);
        expect(previewCtxStub.fillStyle).toEqual('#000000');
        expect(previewCtxStub.textAlign).toEqual('center');
        expect(generateTextSpy).toHaveBeenCalled();
    });

    it('should confirm text', () => {
        const generateTextSpy = spyOn(service, 'generateText');
        const resetSpy = spyOn(service, 'reset');
        textServiceStub.text = ['a', 'b'];
        service['confirmText']();
        expect(generateTextSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.handlePreviewCanvas).toHaveBeenCalled();
        expect(drawingServiceSpy.autoSave).toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
    });

    it('should set font style on mouse enter', () => {
        service.onMouseEnter();
        expect(setFontStyleSpy).toHaveBeenCalled();
    });

    it('should generate text when key is up', () => {
        let generateTextSpy: jasmine.Spy<any>;
        generateTextSpy = spyOn<any>(service, 'generateText').and.callThrough();
        textServiceStub.text = ['b', 'c', 'Enter', 'd', 'e'];
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.onKeyUp(keyboardEvent);
        expect(generateTextSpy).toHaveBeenCalled();
    });

    it('should generate text  when key is upelse case', () => {
        textServiceStub.textAlign = 'center';
        let generateTextSpy: jasmine.Spy<any>;
        generateTextSpy = spyOn<any>(service, 'generateText').and.callThrough();
        textServiceStub.text = ['b', 'c', 'Enter', '|', 'd', 'e', 'Enter'];
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.onKeyUp(keyboardEvent);
        expect(generateTextSpy).toHaveBeenCalled();
    });

    it('should generate text when key is up else case', () => {
        textServiceStub.textAlign = 'end';
        let generateTextSpy: jasmine.Spy<any>;
        generateTextSpy = spyOn<any>(service, 'generateText').and.callThrough();
        textServiceStub.text = ['b', 'c', 'Enter', '|', 'd', 'e', 'Enter'];
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.onKeyUp(keyboardEvent);
        expect(generateTextSpy).toHaveBeenCalled();
    });

    it('isfirstRow should return true if the cursor is in the first line', () => {
        textServiceStub.text = ['|', 'a', 'b', 'c', 'Enter', 'd', 'e'];
        textServiceStub.indexPosition = textServiceStub.text.indexOf('|');
        expect(service['isFirstRow']()).toBeTrue();
    });

    it('isfirstRow should return true if the cursor is in the first line', () => {
        textServiceStub.text = ['|', 'p', 'h', 'c'];
        textServiceStub.indexPosition = textServiceStub.text.indexOf('|');
        expect(service['isFirstRow']()).toBeTrue();
    });

    it('isfirstRow should return false after Enter', () => {
        textServiceStub.text = ['b', 'd', 'c', 'Enter', '|'];
        textServiceStub.indexPosition = textServiceStub.text.indexOf('|');
        expect(service['isFirstRow']()).toBeFalse();
    });

    it('isLastRow should return true after Enter', () => {
        textServiceStub.text = ['a', 'b', 'c', 'Enter', '|'];
        textServiceStub.indexPosition = textServiceStub.text.indexOf('|');
        expect(service['isLastRow']()).toBeTrue();
    });
    it('Should call moveCursorUpDown when  arrow down', () => {
        textServiceStub.isNewWriting = true;
        textServiceStub.indexPosition = 1;
        textServiceStub.text = ['a', 'Enter', 'b', 'c', 'd', 'e', 'f'];
        const moveLineSpy = spyOn<any>(service, 'moveCursorUpDown');
        const keyboardEvent = new KeyboardEvent('keydown', { key: KeyValues.ARROW_DOWN });
        service.onKeyDown(keyboardEvent);
        expect(moveLineSpy).toHaveBeenCalledWith('DOWN');
    });

    it('Should call moveCursorUpDown when  arrow up', () => {
        textServiceStub.text = ['a', 'Enter', 'b', 'c', 'd', 'e', 'f'];
        const moveLineSpy = spyOn<any>(service, 'moveCursorUpDown');
        const keyboardEvent = new KeyboardEvent('keydown', { key: KeyValues.ARROW_UP });
        service.onKeyDown(keyboardEvent);
        expect(moveLineSpy).toHaveBeenCalledWith('UP');
    });

    it('Should call moveCursorLeftRight when  arrow left', () => {
        textServiceStub.text = ['a', 'b', 'b', 'c', 'd', 'e', 'f'];
        const spy = spyOn<any>(service, 'moveCursorLeftRight').and.callThrough();
        const keyboardEvent = new KeyboardEvent('keydown', { key: KeyValues.ARROW_LEFT });
        service.onKeyDown(keyboardEvent);
        expect(spy).toHaveBeenCalledWith(MOVE_LEFT);
    });

    it('Should call moveCursorLeftRight when  arrow left else case when distance is 0', () => {
        textServiceStub.text = [];
        service['moveCursorLeftRight'](-1);
        const keyboardEvent = new KeyboardEvent('keydown', { key: KeyValues.ARROW_LEFT });
        service.onKeyDown(keyboardEvent);
        expect(textServiceStub.indexPosition).toEqual(0);
    });
    it('Should call moveCursorLeftRight when  arrow left else case when distance is 1', () => {
        textServiceStub.text = [];
        service['moveCursorLeftRight'](1);
        const keyboardEvent = new KeyboardEvent('keydown', { key: KeyValues.ARROW_RIGHT });
        service.onKeyDown(keyboardEvent);
        expect(textServiceStub.indexPosition).toEqual(1);
    });

    it('Should call moveCursorLeftRight when arrow RIGHT', () => {
        textServiceStub.text = ['a', 'b', 'b', 'c', 'd', 'e', 'f'];
        const spy = spyOn<any>(service, 'moveCursorLeftRight');
        const keyboardEvent = new KeyboardEvent('keydown', { key: KeyValues.ARROW_RIGHT });
        service.onKeyDown(keyboardEvent);
        expect(spy).toHaveBeenCalledWith(1);
    });

    it('Should call preventDefault when Alt', () => {
        textServiceStub.isNewWriting = true;
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Alt' });
        const spy = spyOn(keyboardEvent, 'preventDefault');
        service.onKeyDown(keyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('Should confirm text when Escape', () => {
        confirmTextSpy = spyOn<any>(service, 'confirmText');
        textServiceStub.isNewWriting = true;
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        service.onKeyDown(event);
        expect(confirmTextSpy).toHaveBeenCalled();
    });
});
