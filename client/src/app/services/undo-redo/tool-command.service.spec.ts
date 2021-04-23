import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import {
    DEFAULT_ANGLE,
    DEFAULT_DROPLET_RADIUS,
    DEFAULT_FREQUENCY,
    DEFAULT_JET_RADIUS,
    DEFAULT_SIZE,
    DEFAULT_THICKNESS_ERASER,
    MIN_TOLERANCE,
} from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SelectionMode, StampChoiceLabels } from '@app/classes/enums/draw-enums';
import { SelectionEllipse, SelectionRectangle } from '@app/classes/interfaces/select-interface';
import { EllipseAttributes, PolygonAttributes, RectangleAttributes } from '@app/classes/interfaces/shapes-attributes';
import {
    BucketAttributes,
    EraserAttributes,
    LassoUndoAttributes,
    LineAttributes,
    PencilAttributes,
    ResizeAttributes,
    SprayAttributes,
    StampAttributes,
    TextAttributes,
} from '@app/classes/interfaces/tools-attributes';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
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
import { TextService } from '@app/services/tools/text/text.service';
import { ToolCommandService } from '@app/services/undo-redo/tool-command.service';
import { BehaviorSubject } from 'rxjs';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('ToolCommandService', () => {
    let service: ToolCommandService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;
    let lineServiceSPy: jasmine.SpyObj<LineService>;
    let rectangleServiceSpy: jasmine.SpyObj<RectangleService>;
    let polygonServiceSPy: jasmine.SpyObj<PolygonService>;
    let ellipseServiceSpy: jasmine.SpyObj<EllipseService>;
    let pencilServiceSpy: jasmine.SpyObj<PencilService>;
    let eraserServiceSpy: jasmine.SpyObj<EraserService>;
    let sprayServiceSpy: jasmine.SpyObj<SprayService>;
    let drawingResizerSpy: jasmine.SpyObj<DrawingResizerService>;
    let selectEllipseServiceSpy: jasmine.SpyObj<SelectEllipseService>;
    let selectRectangleServiceSpy: jasmine.SpyObj<SelectRectangleService>;
    let selectLassoServiceSpy: jasmine.SpyObj<SelectLassoService>;
    let stampServiceSpy: jasmine.SpyObj<StampService>;
    let textServiceSpy: jasmine.SpyObj<TextService>;
    let bucketServiceSpy: jasmine.SpyObj<BucketService>;
    let lineAttributes: LineAttributes;
    let rectangleAttributes: RectangleAttributes;
    let polygonAttributes: PolygonAttributes;
    let ellipseAttributes: EllipseAttributes;
    let pencilAttributes: PencilAttributes;
    let eraserAttributes: EraserAttributes;
    let sprayAttributes: SprayAttributes;
    let resizeAttributes: ResizeAttributes;
    let stampAttributes: StampAttributes;
    let textAttributes: TextAttributes;
    let selectionRectangle: SelectionRectangle;
    let selectionLasso: LassoUndoAttributes;
    let selectionEllipse: SelectionEllipse;
    let bucketAttributes: BucketAttributes;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['']);
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'putImageData']);
        lineServiceSPy = jasmine.createSpyObj('LineService', ['drawLineWithJunctions']);
        polygonServiceSPy = jasmine.createSpyObj('PolygonService', ['draw']);
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', ['draw']);
        ellipseServiceSpy = jasmine.createSpyObj('EllipseService', ['draw']);
        pencilServiceSpy = jasmine.createSpyObj('PencilService', ['drawPencil']);
        eraserServiceSpy = jasmine.createSpyObj('EraserService', ['eraseLine']);
        sprayServiceSpy = jasmine.createSpyObj('SprayService', ['drawSpray', 'updateSprayAttributes', 'canvasImageData']);
        bucketServiceSpy = jasmine.createSpyObj('BucketService', ['updateBucketAttributes']);
        drawingResizerSpy = jasmine.createSpyObj('DrawingResizerService', ['updateCanvasData', 'canvasImageData']);
        selectEllipseServiceSpy = jasmine.createSpyObj('SelectEllipseService', ['updateImage', 'updateSelection']);
        selectRectangleServiceSpy = jasmine.createSpyObj('SelectRectangleService', ['updateImage', 'updateSelection']);
        selectLassoServiceSpy = jasmine.createSpyObj('SelectLassoService', ['updateLassoImage', 'updateLassoSelection']);
        stampServiceSpy = jasmine.createSpyObj('StampService', ['drawStampIcon']);
        textServiceSpy = jasmine.createSpyObj('TextService', ['updateText']);
        const mousePosition: Vec2 = { x: 10, y: 10 };
        const mousePosition3: Vec2 = { x: 11, y: 11 };
        lineAttributes = {
            name: TOOL_LABELS.LINE,
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
        rectangleAttributes = {
            name: TOOL_LABELS.RECTANGLE,
            initialPoint: { x: 5, y: 6 },
            finalPoint: { x: 0, y: 9 },
            width: 5,
            height: 6,
            style: 1,
            mainColor: 'black',
            secondaryColor: 'pink',
            thickness: 1,
            isShiftDown: true,
            numberOfSides: 0,
        };
        polygonAttributes = {
            name: TOOL_LABELS.POLYGON,
            initialPoint: { x: 0, y: 5 },
            finalPoint: { x: 3, y: 5 },
            center: { x: 6, y: 7 },
            radius: 7,
            numberOfSides: 3,
            mainColor: 'black',
            secondaryColor: 'pink',
            thickness: 1,
            style: 1,
        };
        ellipseAttributes = {
            name: TOOL_LABELS.ELLIPSE,
            initialPoint: { x: 0, y: 0 },
            finalPoint: { x: 0, y: 0 },
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            circleCenter: { x: 0, y: 0 },
            circleRadius: { x: 0, y: 0 },
            mainColor: 'black',
            secondaryColor: 'pink',
            thickness: 1,
            style: 1,
            isShiftDown: true,
            numberOfSides: 0,
        };
        pencilAttributes = {
            name: TOOL_LABELS.PENCIL,
            pathData: [],
            mainColor: 'black',
            thickness: 1,
            secondaryColor: 'pink',
        };
        eraserAttributes = {
            name: TOOL_LABELS.ERASER,
            pathData: [],
            mainColor: 'black',
            thickness: DEFAULT_THICKNESS_ERASER,
            secondaryColor: 'pink',
        };
        sprayAttributes = {
            name: TOOL_LABELS.SPRAY,
            mainColor: 'black',
            secondaryColor: 'black',
            thickness: 1,
            jetDiameter: DEFAULT_JET_RADIUS,
            pathData: { x: 0, y: 0 },
            dropletDiameter: DEFAULT_DROPLET_RADIUS,
            frequency: DEFAULT_FREQUENCY,
            imageData: sprayServiceSpy.canvasImageData,
        };

        resizeAttributes = {
            name: 'resizer',
            canvasSize: { x: 2, y: 1 },
            imageData: drawingResizerSpy.canvasImageData,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
        };

        textAttributes = {
            name: TOOL_LABELS.TEXT,
            imageData: drawingResizerSpy.canvasImageData,
            mainColor: colorServiceSpy.primaryColor,
            secondaryColor: '',
            thickness: 1,
        };
        selectionEllipse = {
            name: SelectionMode.ELLIPSE,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
        };
        selectionRectangle = {
            name: SelectionMode.RECTANGLE,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
        };
        selectionLasso = {
            name: SelectionMode.LASSO,
            segment: { firstPoint: mousePosition, lastPoint: mousePosition3 },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [{ firstPoint: mousePosition, lastPoint: mousePosition3 }],
            dotRadius: 1,
            image: new ImageData(1, 1),
            width: 0,
            height: 0,
            topLeft: { x: 0, y: 0 },
            initialPoint: { x: 0, y: 0 },
            imageCanvas: selectLassoServiceSpy.canvasVignete,
            imageContexte: selectLassoServiceSpy.canvasVigneteCtx,
        };

        stampAttributes = {
            name: TOOL_LABELS.STAMP,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
            size: DEFAULT_SIZE,
            pathData: { x: 0, y: 0 },
            angle: new BehaviorSubject(DEFAULT_ANGLE),
            stampChoice: StampChoiceLabels.FIRST_CHOICE,
        };
        bucketAttributes = {
            name: TOOL_LABELS.BUCKET,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
            tolerance: new BehaviorSubject<number>(MIN_TOLERANCE),
            imageData: bucketServiceSpy.canvasImageData,
        };
        baseCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorService, useValue: colorServiceSpy },
                { provide: LineService, useValue: lineServiceSPy },
                { provide: PolygonService, useValue: polygonServiceSPy },
                { provide: RectangleService, useValue: rectangleServiceSpy },
                { provide: EllipseService, useValue: ellipseServiceSpy },
                { provide: PencilService, useValue: pencilServiceSpy },
                { provide: EraserService, useValue: eraserServiceSpy },
                { provide: SprayService, useValue: sprayServiceSpy },
                { provide: DrawingResizerService, useValue: drawingResizerSpy },
                { provide: SelectEllipseService, useValue: selectEllipseServiceSpy },
                { provide: SelectLassoService, useValue: selectLassoServiceSpy },
                { provide: SelectRectangleService, useValue: selectRectangleServiceSpy },
                { provide: StampService, useValue: stampServiceSpy },
                { provide: BucketService, useValue: bucketServiceSpy },
                { provide: SelectRectangleService, useValue: selectRectangleServiceSpy },
                { provide: TextService, useValue: textServiceSpy },
            ],
        });
        service = TestBed.inject(ToolCommandService);

        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].baseCtx = baseCtxStub;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should execute line when selected tool is line', () => {
        service.executeCommand(lineAttributes);
        expect(lineServiceSPy.drawLineWithJunctions).toHaveBeenCalled();
    });

    it('should execute rectangle when selected tool is rectangle', () => {
        service.executeCommand(rectangleAttributes);
        expect(rectangleServiceSpy.draw).toHaveBeenCalled();
    });
    it('should execute polygon when selected tool is polygon', () => {
        service.executeCommand(polygonAttributes);
        expect(polygonServiceSPy.draw).toHaveBeenCalled();
    });
    it('should execute ellipse when selected tool is ellipse', () => {
        service.executeCommand(ellipseAttributes);
        expect(ellipseServiceSpy.draw).toHaveBeenCalled();
    });

    it('should execute pencil when selected tool is pencil', () => {
        service.executeCommand(pencilAttributes);
        expect(pencilServiceSpy.drawPencil).toHaveBeenCalled();
    });
    it('should execute eraser when selected tool is eraser', () => {
        service.executeCommand(eraserAttributes);
        expect(eraserServiceSpy.eraseLine).toHaveBeenCalled();
    });

    it('should execute spray when selected tool is spray', () => {
        service.executeCommand(sprayAttributes);
        expect(sprayServiceSpy.updateSprayAttributes).toHaveBeenCalled();
    });
    it('should execute resizer when selected tool is resizer', () => {
        service.executeCommand(resizeAttributes);
        expect(drawingResizerSpy.updateCanvasData).toHaveBeenCalled();
    });

    it('should execute selection rectangle when selected tool is selected rectangle', () => {
        service.executeCommand(selectionRectangle);
        expect(selectRectangleServiceSpy.updateImage).toHaveBeenCalled();
        expect(selectRectangleServiceSpy.updateSelection).toHaveBeenCalled();
    });
    it('should execute selection ellipse when selected tool is selected rectangle', () => {
        service.executeCommand(selectionEllipse);
        expect(selectEllipseServiceSpy.updateImage).toHaveBeenCalled();
        expect(selectEllipseServiceSpy.updateSelection).toHaveBeenCalled();
    });
    it('should not execute selection when selected tool is selected resizer', () => {
        service.executeCommand(resizeAttributes);
        expect(selectEllipseServiceSpy.updateImage).not.toHaveBeenCalled();
    });
    it('should execute stamp when selected tool is stamp', () => {
        service.executeCommand(stampAttributes);
        expect(stampServiceSpy.drawStampIcon).toHaveBeenCalled();
    });
    it('should execute text when selected tool is text', () => {
        service.executeCommand(textAttributes);
        expect(textServiceSpy.updateText).toHaveBeenCalled();
    });
    it('should execute bucket when selected tool is bucket', () => {
        service.executeCommand(bucketAttributes);
        expect(bucketServiceSpy.updateBucketAttributes).toHaveBeenCalled();
    });
    it('should execute selection lasso when selected tool is selected rectangle', () => {
        service.executeCommand(selectionLasso);
        expect(selectLassoServiceSpy.updateLassoImage).toHaveBeenCalled();
        expect(selectLassoServiceSpy.updateLassoSelection).toHaveBeenCalled();
    });
});
