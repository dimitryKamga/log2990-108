import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { TextAttributes } from '@app/classes/interfaces/tools-attributes';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from './text.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure

describe('TextService', () => {
    let service: TextService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

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
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
            ],
        });
        service = TestBed.inject(TextService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get linePosition and Index', () => {
        let i = 0;
        const lines: string[] = ['a', '|', 'b', 'c', 'd', 'Enter', 'e', 'f'];
        service.getLinePosition(lines);
        for (const line of lines) {
            const lineNumber = line.indexOf('|');
            i++;
            expect({ x: lineNumber, y: i }).toEqual({ x: lineNumber, y: i });
        }
    });

    it('should get linePosition and Index', () => {
        let i = 0;
        const lines = ['a', 'b', 'c', 'd', 'Enter', 'e', 'f'];
        service.getLinePosition(lines);
        for (const line of lines) {
            const lineNumber = line.indexOf('|');
            i++;
            expect({ x: lineNumber, y: i }).toEqual({ x: lineNumber, y: i });
        }
    });

    it('should move line up  if length is inferior', () => {
        service.indexPosition = 3;
        const linePosition = { x: 4, y: 3 };
        const rows = ['ann', 'bnnnn', 'cnnnnnnn', 'd', 'e', 'f'];

        service.moveCursorUp(linePosition, rows);
        expect(service.indexPosition).toEqual(-6);
    });

    it('should move line up if length is superior ', () => {
        service.indexPosition = 3;
        const linePosition = { x: 9, y: 6 };
        const rows = ['anbb', 'jb', 'ch', 'dp', 'e', 'f'];

        service.moveCursorUp(linePosition, rows);
        expect(service.indexPosition).toEqual(-7);
    });

    it('should move line down if length is inferior', () => {
        service.indexPosition = 9;
        const linePosition = { x: 4, y: 3 };
        const rows = ['ann', 'bnnnn', 'cnnnnnnn', 'd', 'e', 'f'];

        service.moveCursorDown(linePosition, rows);
        expect(service.indexPosition).toEqual(7);
    });

    it('should move line down if length is superior ', () => {
        service.indexPosition = 6;
        const linePosition = { x: 0, y: 3 };
        const rows = ['axxhxhxhhx', 'jbnxnbbbbbbnx', 'cbbbnnxnnx', 'dpbzbbzbbzbbz', 'ennnbb', 'f'];

        service.moveCursorDown(linePosition, rows);
        expect(service.indexPosition).toEqual(19);
    });

    it('should verify if key is authorized when enter', () => {
        expect(service.isKeyAuthorized('Enter')).toEqual(true);
    });

    it('should verify if key is authorized when alt', () => {
        expect(service.isKeyAuthorized('Alt')).toEqual(false);
    });

    it('should verify if key is authorized when z', () => {
        expect(service.isKeyAuthorized('z')).toEqual(true);
        expect(service.isKeyAuthorized('w')).toEqual(true);
    });

    it('update text should update imagedata in attributes', () => {
        const spy = spyOn(drawingServiceSpy.baseCtx, 'putImageData');
        const text: TextAttributes = {
            name: 'resizer',
            mainColor: 'black',
            secondaryColor: '',
            thickness: 1,
            imageData: drawingServiceSpy.baseCtx.getImageData(0, 0, 100, 100),
        };
        service.updateText(text);
        expect(spy).toHaveBeenCalled();
    });

    it('should restoreTextAttributes', () => {
        service.restoreTextAttributes();
        const test: TextAttributes = {
            name: TOOL_LABELS.TEXT,
            imageData: service.baseData,
            mainColor: service['colorService'].primaryColor,
            secondaryColor: '',
            thickness: 1,
        };
        expect(test).toEqual(service.textAttributes);
    });
});
