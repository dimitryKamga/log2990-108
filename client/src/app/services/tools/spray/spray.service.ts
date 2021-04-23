import { Injectable, OnDestroy } from '@angular/core';
import { DEFAULT_DROPLET_RADIUS, DEFAULT_FREQUENCY, DEFAULT_JET_RADIUS, DENSITY, ONE_SECOND } from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { MouseButton } from '@app/classes/enums/draw-enums';
import { SprayAttributes } from '@app/classes/interfaces/tools-attributes';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class SprayService extends Tool implements OnDestroy {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.SPRAY;

    sprayAttributes: SprayAttributes;
    timeOut: ReturnType<typeof setTimeout>;
    canvasImageData: ImageData;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        private undoRedoPiles: UndoRedoPilesService,
        private shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        super(drawingService, colorService);

        this.initializeAttributes();
    }

    private setImageData(): void {
        this.canvasImageData = this.drawingService.getCanvasBaseData();
        this.sprayAttributes.imageData = this.canvasImageData;
    }

    private setTimeOut(spray: SprayAttributes): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = false;
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(this.drawSpray.bind(this), ONE_SECOND / spray.frequency, this.drawingService.baseCtx, spray);
    }

    private drawSpray(ctx: CanvasRenderingContext2D, spray: SprayAttributes): void {
        this.setColors();
        for (let i = 0; i < DENSITY; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const radius = Math.random() * spray.jetDiameter;
            const dropRadius = Math.random() * spray.dropletDiameter;
            ctx.fillStyle = spray.mainColor;
            ctx.strokeStyle = spray.mainColor;
            ctx.globalAlpha = Math.random();
            ctx.beginPath();
            ctx.arc(spray.pathData.x + radius * Math.cos(theta), spray.pathData.y + radius * Math.sin(theta), dropRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    initializeAttributes(): void {
        this.sprayAttributes = {
            name: this.name,
            mainColor: this.colorService.primaryColor,
            secondaryColor: this.colorService.secondaryColor,
            thickness: 1,
            jetDiameter: DEFAULT_JET_RADIUS,
            pathData: { x: 0, y: 0 },
            dropletDiameter: DEFAULT_DROPLET_RADIUS,
            frequency: DEFAULT_FREQUENCY,
            imageData: this.canvasImageData,
        };
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOut);
    }

    setColors(): void {
        this.sprayAttributes.mainColor = this.colorService.primaryColor;
    }

    setJetDiameter(jetDiameter: number): void {
        this.sprayAttributes.jetDiameter = jetDiameter;
    }

    setDropletDiameter(dropletDiameter: number): void {
        this.sprayAttributes.dropletDiameter = dropletDiameter;
    }

    setFrequency(frequency: number): void {
        this.sprayAttributes.frequency = frequency;
    }

    onMouseMove(event: MouseEvent): void {
        this.onMouseEnter(event);
        if (this.mouseDown) {
            this.sprayAttributes.pathData = this.getPositionFromMouse(event);
            this.setTimeOut(this.sprayAttributes);
        }
    }

    onMouseEnter(event: MouseEvent): void {
        if (event.buttons === 0) {
            this.mouseDown = false;
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            clearTimeout(this.timeOut);
            this.undoRedoPiles.setSelectedTool(false);
            this.sprayAttributes.pathData = this.getPositionFromMouse(event);
            this.setImageData();
            this.undoRedoPiles.handlePiles(this.sprayAttributes);
            this.drawingService.autoSave();
        }
        this.mouseDown = false;
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    onMouseLeave(): void {
        if (this.mouseDown) {
            clearTimeout(this.timeOut);
            this.setImageData();
            this.undoRedoPiles.handlePiles(this.sprayAttributes);
            this.undoRedoPiles.setSelectedTool(false);
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.baseCtx.filter = 'none';
        this.drawingService.previewCtx.filter = 'none';

        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.sprayAttributes.pathData = this.getPositionFromMouse(event);
            this.setTimeOut(this.sprayAttributes);
            this.undoRedoPiles.setSelectedTool(true);
        }
    }

    updateSprayAttributes(spray: SprayAttributes): void {
        this.drawingService.baseCtx.putImageData(spray.imageData, 0, 0);
    }
}
