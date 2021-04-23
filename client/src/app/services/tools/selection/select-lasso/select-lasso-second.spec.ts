// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés
// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (callFake)
// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SelectionMode } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { SelectService } from '@app/services/tools/selection/select/select.service';

describe('SelectLassoService', () => {
    let service: SelectLassoService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let previewCtxSpy: jasmine.SpyObj<CanvasRenderingContext2D>;
    let selectServiceSpy: jasmine.SpyObj<SelectService>;
    let selectionBoxCanvasTestHelper: CanvasTestHelper;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let tempsCanvas: HTMLCanvasElement;
    let removeLassoImageSpy: jasmine.Spy<any>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['baseCtx', 'clearCanvas', 'previewCtx']);
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['init']);
        previewCtxSpy = jasmine.createSpyObj('CanvasRenderingContext2D', [
            'beginPath',
            'stroke',
            'ellipse',
            'rect',
            'getImageData',
            'fill',
            'fillRect',
            'createImageData',
            'drawImage',
            'moveTo',
            'lineTo',
            'closePath',
            'save',
            'clip',
            'restore',
            'setLineDash',
        ]);
        selectServiceSpy = jasmine.createSpyObj('SelectService', ['drawSelectionBox', 'getSelectedImage']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: SelectService, useValue: selectServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        tempsCanvas = document.createElement('canvas');
        selectionBoxCanvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SelectLassoService);
        service['drawingService'].previewCtx = previewCtxSpy;
        service['drawingService'].baseCtx = baseCtxStub;
        removeLassoImageSpy = spyOn<any>(service, 'removeLassoImage').and.callThrough();
        const ten = 10;
        tempsCanvas.width = ten;
        tempsCanvas.height = ten;
        service['drawingService'].canvas = tempsCanvas;
        service.selectionBox = {
            image: new ImageData(5, 5),
            width: 10,
            height: 10,
            mainColor: '',
            secondaryColor: '',
            name: '',
            thickness: 1,
            topLeft: { x: 10, y: 10 },
            initialPoint: { x: 10, y: 10 },
            imageCanvas: selectionBoxCanvasTestHelper.canvas,
            imageContexte: selectionBoxCanvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D,
        };

        service.previousLassoBox = {
            name: SelectionMode.LASSO,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            topLeft: { x: 0, y: 0 },
            initialPoint: { x: 0, y: 0 },
            imageCanvas: new CanvasTestHelper().canvas,
            imageContexte: new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D,
        };
        service.controlPoints = {
            topLeft: { x: 0, y: 0 },
            top: { x: 5, y: 0 },
            topRight: { x: 10, y: 0 },
            right: { x: 10, y: 5 },
            bottomRight: { x: 10, y: 10 },
            bottom: { x: 5, y: 10 },
            bottomLeft: { x: 0, y: 10 },
            left: { x: 0, y: 5 },
        };
        service.lassoAttributes = {
            name: TOOL_LABELS.LASSO,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [
                { x: 1, y: 1 },
                { x: 1, y: 5 },
                { x: 2, y: 2 },
                { x: 3, y: 3 },
            ],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [{ firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } }],
            dotRadius: 1,
        };

        service.lassoUndo = {
            name: SelectionMode.LASSO,
            segment: service.lassoAttributes.segment,
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: service.lassoAttributes.mouseClicks,
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
            image: service.selectionBox.image,
            width: service.selectionBox.width,
            height: service.selectionBox.height,
            topLeft: service.selectionBox.topLeft,
            initialPoint: service.selectionBox.initialPoint,
            imageCanvas: new CanvasTestHelper().canvas,
            imageContexte: new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D,
        };
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clearImage when movePaste is true', () => {
        service.movePaste = true;
        service['clearImage'](previewCtxSpy, service.selectionBox);
        expect(previewCtxSpy.clip).not.toHaveBeenCalled();
    });
    it('should clearImage when movePaste is true', () => {
        service.movePaste = true;
        service.lassoAttributes.isLastPoint = true;
        service['clearImage'](previewCtxSpy, service.selectionBox);
        expect(previewCtxSpy.clip).toHaveBeenCalled();
    });

    it('should call removeLassoImage when movePaste is true', () => {
        service.movePaste = true;

        service.lassoUndo.mouseClicks = [
            { x: 1, y: 1 },
            { x: 1, y: 5 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];

        service.previousLassoBox.mouseClicks = [
            { x: 1, y: 1 },
            { x: 1, y: 5 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        service.lassoUndo.initialPoint = { x: 0, y: 0 };
        service.updateLassoImage(previewCtxSpy, service.lassoUndo);
        expect(removeLassoImageSpy).toHaveBeenCalled();
    });
    it('should call drawimage when movePaste is true', () => {
        service.lassoUndo.mouseClicks = [
            { x: 1, y: 1 },
            { x: 1, y: 5 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ];
        service.movePaste = true;

        service.lassoUndo.imageCanvas = service.selectionBox.imageCanvas;
        service.lassoUndo.topLeft = { x: 0, y: 0 };
        service.updateLassoSelection(previewCtxSpy, service.lassoUndo);
        expect(previewCtxSpy.drawImage).toHaveBeenCalled();
    });
});
