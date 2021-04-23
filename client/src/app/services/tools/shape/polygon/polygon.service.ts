import { Injectable } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { ShapeStyle } from '@app/classes/enums/draw-enums';
import { PolygonAttributes, ShapeAttributes } from '@app/classes/interfaces/shapes-attributes';
import { GeneralFunctionsService } from '@app/classes/mathematics/general-functions.service';
import { TrigonometryService } from '@app/classes/mathematics/trigonometry.service';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { ShapeService } from '@app/services/tools/shape/shape.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class PolygonService extends ShapeService {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.POLYGON;

    polygonAttributes: PolygonAttributes;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        undoRedoPiles: UndoRedoPilesService,
        private generalFunctions: GeneralFunctionsService,
        private trigonometry: TrigonometryService,
        protected shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        super(drawingService, colorService, undoRedoPiles, shortcutsHandlerService);
        this.initializeAttributes();
        this.initializePolygonAttributes();
    }

    private drawBoundingCircle(ctx: CanvasRenderingContext2D, polygon: PolygonAttributes): void {
        if (this.isDrawing) {
            super.setBoundingBoxStyle(ctx);
            const adjust = this.trigonometry.calculatePolygonCornerWidth(polygon.numberOfSides, polygon.thickness) / 2;
            ctx.ellipse(polygon.center.x, polygon.center.y, polygon.radius + adjust, polygon.radius + adjust, 0, 0, Math.PI * 2, false);

            ctx.stroke();
            ctx.setLineDash([]);
            this.setContextStyle(ctx, this.shapeAttributes);
            ctx.beginPath();
        }
    }

    private setPolygonRadiusAndCenter(shape: ShapeAttributes, polygon: PolygonAttributes): void {
        const adjust = this.trigonometry.calculatePolygonCornerWidth(shape.numberOfSides, polygon.thickness) / 2;
        this.checkShapeIsInCanvas(shape, adjust);
        const xRadius = (shape.finalPoint.x - shape.initialPoint.x) / 2;
        const yRadius = (shape.finalPoint.y - shape.initialPoint.y) / 2;
        polygon.radius = this.generalFunctions.getShorterSide(xRadius, yRadius);
        polygon.center = {
            x: shape.initialPoint.x + polygon.radius * this.generalFunctions.getDirection(xRadius),
            y: shape.initialPoint.y + polygon.radius * this.generalFunctions.getDirection(yRadius),
        };
    }

    protected setShapeStyleAndThickness(shape: ShapeAttributes): void {
        shape.style = this.polygonAttributes.style;
        shape.thickness = this.polygonAttributes.thickness;
    }

    protected drawShape(ctx: CanvasRenderingContext2D, shape: ShapeAttributes): void {
        this.setPolygonRadiusAndCenter(shape, this.polygonAttributes);
        const polygon = this.polygonAttributes;
        this.drawBoundingCircle(ctx, polygon);
        ctx.moveTo(polygon.center.x, polygon.center.y - polygon.radius);
        for (let i = 1; i <= shape.numberOfSides + 1; i++) {
            ctx.lineTo(
                polygon.center.x + polygon.radius * Math.cos((i * 2 * Math.PI) / shape.numberOfSides - Math.PI / 2),
                polygon.center.y + polygon.radius * Math.sin((i * 2 * Math.PI) / shape.numberOfSides - Math.PI / 2),
            );
        }
    }

    protected setShapeNumberOfSide(shape: ShapeAttributes): void {
        shape.numberOfSides = this.polygonAttributes.numberOfSides;
    }

    initializePolygonAttributes(): void {
        this.polygonAttributes = {
            name: this.name,
            initialPoint: { x: 0, y: 0 },
            finalPoint: { x: 0, y: 0 },
            center: { x: 0, y: 0 },
            radius: 0,
            numberOfSides: 3,
            mainColor: this.colorService.primaryColor,
            secondaryColor: this.colorService.secondaryColor,
            thickness: 1,
            style: ShapeStyle.BORDER,
        };
    }

    setThickness(thickness: number): void {
        this.polygonAttributes.thickness = thickness;
    }

    setStyle(style: number): void {
        this.polygonAttributes.style = style;
    }

    setSides(sideNumber: number): void {
        this.polygonAttributes.numberOfSides = sideNumber;
    }

    // Ceci est justifié vu qu'on a des fonctions qui seront gérés par les autres classes enfant mais ne feront rien dans cette class enfant
    // tslint:disable:no-empty | raison: Pour des fonctions a instructions vides

    onKeyDown(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}
}
