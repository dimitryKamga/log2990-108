import { Injectable } from '@angular/core';
import { MAX_DISTANCE_JUNCTIONS } from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { Angles, MouseButton, Quad } from '@app/classes/enums/draw-enums';
import { LineDraw, LineVariables } from '@app/classes/interfaces/line-interfaces';
import { LineAttributes } from '@app/classes/interfaces/tools-attributes';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { LineFunctionsService } from '@app/classes/mathematics/line-functions.service';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.LINE;

    mouseTransition: Vec2;
    isShiftActive: boolean;
    isDrawing: boolean;
    nbOfClicks: number;
    mousePosition: MouseEvent;

    private lineVariables: LineVariables;
    private lastPosition: Vec2;

    lineDraw: LineDraw;
    lineAttributes: LineAttributes;

    constructor(
        drawingService: DrawingService,
        private generalFunctions: GeneralFunctionsService,
        private lineFunctions: LineFunctionsService,
        colorService: ColorService,
        private undoRedoPiles: UndoRedoPilesService,
        private shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        super(drawingService, colorService);

        this.initialize();
        this.initializeAttributes();
        this.initializeVariables();
    }

    private initialize(): void {
        this.mouseTransition = { x: 0, y: 0 };
        this.isShiftActive = false;
        this.nbOfClicks = 0;
        this.isDrawing = false;
    }

    private verifyDoubleClick(): boolean {
        // Verifie si les coordonnees des 2 derniers clicks sont similaires
        const firstMouseClick: Vec2 = {
            x: this.lineAttributes.mouseClicks[this.nbOfClicks - 2].x,
            y: this.lineAttributes.mouseClicks[this.nbOfClicks - 2].y,
        };
        const secondMouseClick: Vec2 = {
            x: this.lineAttributes.mouseClicks[this.nbOfClicks - 1].x,
            y: this.lineAttributes.mouseClicks[this.nbOfClicks - 1].y,
        };
        return firstMouseClick.x === secondMouseClick.x && firstMouseClick.y === secondMouseClick.y;
    }

    private onMouseDoubleClick(): void {
        if (this.verifyDoubleClick() || this.lineAttributes.isDoubleClicked) {
            this.undoRedoPiles.setSelectedTool(true);
            this.isDrawing = false;
            this.getDistancePoints(this.lineAttributes, 2);
            this.drawLineWithJunctions(this.drawingService.baseCtx, this.lineAttributes);
            this.undoRedoPiles.handlePiles(this.lineAttributes);
            this.drawingService.autoSave();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            // Vide les tableaux de segments et de ligne
            this.lineAttributes.savedSegment = [];
            this.lineAttributes.mouseClicks = [];
            this.lineAttributes.isDoubleClicked = false;
            this.undoRedoPiles.setSelectedTool(false);
            this.shortcutsHandlerService.isShortcutKeyEnabled = true;
        }
    }
    private rotateAngle(mousePosition: Vec2, lineVariables: LineVariables, lineAttributes: LineAttributes): void {
        // calcule les angles multiples de 45 degres
        this.lineFunctions.calculateRotationAngle(mousePosition, lineVariables, lineAttributes);
        this.lastPosition = this.lineFunctions.rotateAngle(this.lineVariables);
    }

    private drawDots(radius: number, ctx: CanvasRenderingContext2D): void {
        let dot = this.lineAttributes.mouseClicks.length;

        if (ctx === this.drawingService.baseCtx) {
            dot--;
            this.lineAttributes.mouseClicks[this.lineAttributes.mouseClicks.length - 2] = this.lineAttributes.mouseClicks[
                this.lineAttributes.mouseClicks.length - 1
            ];
            this.lineAttributes.mouseClicks.pop();
            if (this.lineAttributes.isDoubleClicked) {
                this.lineAttributes.mouseClicks[this.lineAttributes.mouseClicks.length - 1] = this.lineAttributes.savedSegment[
                    this.lineAttributes.savedSegment.length - 1
                ].lastPoint;
            }
        }
        for (let i = 0; i < dot; i++) {
            ctx.lineWidth = 1;
            this.setColors();
            ctx.strokeStyle = this.lineAttributes.mainColor;
            ctx.fillStyle = this.lineAttributes.secondaryColor;
            ctx.beginPath();
            ctx.arc(this.lineAttributes.mouseClicks[i].x, this.lineAttributes.mouseClicks[i].y, radius / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }

    getDistancePoints(lineAttributes: LineAttributes, clickDifference: number): void {
        const distance = this.generalFunctions.getDistanceBetweenTwoPoints(
            lineAttributes.mouseClicks[0],
            lineAttributes.mouseClicks[this.nbOfClicks - clickDifference],
        );
        // verifie la distance des 20 pixels, si elle inferieure, les points s'attachemt
        if (distance < MAX_DISTANCE_JUNCTIONS) {
            lineAttributes.mouseClicks[lineAttributes.mouseClicks.length - clickDifference + 1] = lineAttributes.mouseClicks[0];
            lineAttributes.savedSegment[lineAttributes.savedSegment.length - 1].lastPoint = lineAttributes.mouseClicks[0];
            lineAttributes.isLastPoint = true;
        }
    }

    drawSegment(lineAttributes: LineAttributes): void {
        this.lineDraw.thickness = lineAttributes.thickness;
        this.lineDraw.ctx = this.drawingService.previewCtx;
        if (!this.isDrawing) {
            return;
        }

        lineAttributes.segment = {
            firstPoint: lineAttributes.mouseClicks[this.nbOfClicks - 2],
            lastPoint: this.lastPosition,
        };
        this.setColors();
        this.lineDraw.ctx.strokeStyle = lineAttributes.mainColor;
        this.lineDraw.ctx.fillStyle = lineAttributes.mainColor;
        this.drawLine(lineAttributes.segment.firstPoint, lineAttributes.segment.lastPoint, this.lineDraw);
        if (lineAttributes.isJunction) {
            this.drawDots(lineAttributes.dotRadius, this.drawingService.previewCtx);
        }
        lineAttributes.savedSegment.push(lineAttributes.segment);
        lineAttributes.mouseClicks[lineAttributes.mouseClicks.length - 1] = this.lastPosition;
    }

    removeLastLine(lineAttributes: LineAttributes): void {
        lineAttributes.savedSegment.pop();
        lineAttributes.mouseClicks.pop();
        --this.nbOfClicks;
        this.drawingService.clearCanvas(this.lineDraw.ctx);

        lineAttributes.savedSegment.forEach((segment) => {
            this.drawLine(segment.firstPoint, segment.lastPoint, this.lineDraw);
        });
        // Dessine la previsualition de l'ancienne ligne

        this.drawLine(lineAttributes.mouseClicks[this.nbOfClicks - 1], this.lastPosition, this.lineDraw);

        // Dessine la jonction si le bouton est active
        if (lineAttributes.isJunction) {
            this.drawDots(lineAttributes.dotRadius, this.drawingService.previewCtx);
        }
    }

    drawLine(firstPoint: Vec2, lastPoint: Vec2, lineDraw: LineDraw): void {
        lineDraw.ctx.lineCap = 'round';

        lineDraw.ctx.lineWidth = lineDraw.thickness;
        lineDraw.ctx.beginPath();
        lineDraw.ctx.moveTo(firstPoint.x, firstPoint.y);
        lineDraw.ctx.lineTo(lastPoint.x, lastPoint.y);
        lineDraw.ctx.stroke();
    }

    initializeAttributes(): void {
        this.lineAttributes = {
            name: TOOL_LABELS.LINE,
            segment: { firstPoint: { x: 0, y: 0 }, lastPoint: { x: 0, y: 0 } },
            mainColor: this.colorService.primaryColor,
            secondaryColor: this.colorService.secondaryColor,
            mouseClicks: [],
            isJunction: false,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: false,
            isLastPoint: false,
            savedSegment: [],
            dotRadius: 1,
        };
    }
    initializeVariables(): void {
        this.lineVariables = {
            angle: 0,
            gradient: Angles._0,
            mousePosition: { x: 0, y: 0 },
            contiguous: 0,
            opposite: 0,
            mouseClicks: [],
            quad: Quad.TOP_RIGHT,
            hypothenuse: 0,
            radians: 0,
        };

        this.lineDraw = {
            ctx: this.drawingService.previewCtx,
            thickness: 0,
        };
    }

    drawLineWithJunctions(ctx: CanvasRenderingContext2D, lineAttributes: LineAttributes): void {
        lineAttributes.savedSegment.forEach((segment) => {
            this.setColors();
            ctx.strokeStyle = lineAttributes.mainColor;
            ctx.fillStyle = lineAttributes.secondaryColor;
            ctx.lineCap = 'round';
            ctx.lineWidth = lineAttributes.thickness;
            ctx.beginPath();
            ctx.moveTo(segment.firstPoint.x, segment.firstPoint.y);
            ctx.lineTo(segment.lastPoint.x, segment.lastPoint.y);
            ctx.stroke();
        });
        this.lineFunctions.isJunctionActive(ctx, lineAttributes);
    }

    setColors(): void {
        this.lineAttributes.mainColor = this.colorService.primaryColor;
        this.lineAttributes.secondaryColor = this.colorService.secondaryColor;
    }

    updateJunction(isJunction: boolean): void {
        this.lineAttributes.isJunction = isJunction;
    }

    updateThickness(thickness: number): void {
        this.lineAttributes.thickness = thickness;
    }

    updateDotRadius(radius: number): void {
        this.lineAttributes.dotRadius = radius;
    }

    reset(): void {
        this.lineAttributes.savedSegment = [];
        this.lineAttributes.mouseClicks = [];
        this.nbOfClicks = 0;
        this.isDrawing = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    onMousePosition(point: Vec2, lineAttributes: LineAttributes, mouseTransition: Vec2): void {
        if (point.x === mouseTransition.x && point.y === mouseTransition.y) {
            lineAttributes.isDoubleClicked = true;
        }
        mouseTransition = point;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';

        if (event.button === MouseButton.LEFT) {
            this.isDrawing = true;
            this.shortcutsHandlerService.isShortcutKeyEnabled = false;
            this.lineAttributes.mouseClicks.push(this.getPositionFromMouse(event));
            this.nbOfClicks = this.lineAttributes.mouseClicks.length;

            // Verifie si une ligne a ete commencee
            if (this.nbOfClicks <= 1) {
                return;
            }
            const point: Vec2 = this.getPositionFromMouse(event);

            this.onMousePosition(point, this.lineAttributes, this.mouseTransition);
            this.onMouseDoubleClick();
            this.drawSegment(this.lineAttributes);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.setColors();
        this.lineDraw.thickness = this.lineAttributes.thickness;
        this.lineDraw.ctx = this.drawingService.previewCtx;
        this.lineDraw.ctx.strokeStyle = this.lineAttributes.mainColor;
        this.lineDraw.ctx.fillStyle = this.lineAttributes.mainColor;
        this.mousePosition = event;
        if (this.isDrawing) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const point = this.getPositionFromMouse(event);

            this.onPositionMove(point, this.lineAttributes);
        }
    }

    onPositionMove(point: Vec2, lineAttributes: LineAttributes): void {
        // dessine les segments de ligne en previsualisation
        lineAttributes.savedSegment.forEach((segment) => {
            this.drawLine(segment.firstPoint, segment.lastPoint, this.lineDraw);
        });

        if (lineAttributes.isJunction) {
            this.drawDots(lineAttributes.dotRadius, this.drawingService.previewCtx);
        }

        if (this.isShiftActive) {
            this.rotateAngle(point, this.lineVariables, lineAttributes);
        } else {
            this.lastPosition = point;
        }
        this.drawLine(lineAttributes.mouseClicks[this.nbOfClicks - 1], this.lastPosition, this.lineDraw);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Shift') {
            this.isShiftActive = true;
            this.onMouseMove(this.mousePosition);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Shift': {
                this.isShiftActive = false;
                this.onMouseMove(this.mousePosition);
                break;
            }
            case 'Backspace': {
                if (this.nbOfClicks > 1) {
                    this.removeLastLine(this.lineAttributes);
                }
                break;
            }
            case 'Escape': {
                this.reset();
                break;
            }
        }
    }
}
