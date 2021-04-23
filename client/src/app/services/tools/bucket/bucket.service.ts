import { Injectable } from '@angular/core';
import { RGBA_INDEXER } from '@app/classes/constants/color-constant';
import { MAXIMUM_RGBA_VALUE, MIN_TOLERANCE, PERCENTAGE_100, RGBA_LENGTH } from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { MouseButton } from '@app/classes/enums/draw-enums';
import { Rgba } from '@app/classes/interfaces/color-interface';
import { BucketAttributes } from '@app/classes/interfaces/tools-attributes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BucketService extends Tool {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.BUCKET;

    bucketAttributes: BucketAttributes;
    canvasImageData: ImageData;
    initialPixelData: Uint8ClampedArray;

    constructor(drawingService: DrawingService, colorService: ColorService, private undoRedoPilesService: UndoRedoPilesService) {
        super(drawingService, colorService);
        this.initializeAttributes();
    }

    private contiguousFill(): void {
        const pixelData = this.drawingService.getPixelData(this.mouseDownCoord);
        const pixelsStack: Vec2[] = [this.mouseDownCoord];
        const coloredPixels: Map<string, boolean> = new Map();
        const canvasData: ImageData = this.drawingService.getCanvasBaseData();

        while (pixelsStack.length) {
            const currentPixel = pixelsStack.pop() as Vec2;
            const index = (currentPixel.x + currentPixel.y * this.drawingService.canvas.width) * RGBA_LENGTH;
            if (coloredPixels.has(this.toString(currentPixel))) {
                continue;
            } else if (this.isInToleranceValue(pixelData, canvasData, index)) {
                this.setColor(index, canvasData);
                coloredPixels.set(this.toString(currentPixel), true);
                this.findBorders(pixelsStack, currentPixel);
            }
        }
        this.bucketAttributes.imageData = canvasData;
        this.drawingService.baseCtx.putImageData(canvasData, 0, 0);
        this.undoRedoPilesService.handlePiles(this.bucketAttributes);
    }

    private setColor(index: number, canvasData: ImageData): void {
        const rgbaPrimaryColor: Rgba = this.colorService.getRgba(this.colorService.primaryColor);
        canvasData.data[index + RGBA_INDEXER.RED] = rgbaPrimaryColor.RED;
        canvasData.data[index + RGBA_INDEXER.GREEN] = rgbaPrimaryColor.GREEN;
        canvasData.data[index + RGBA_INDEXER.BLUE] = rgbaPrimaryColor.BLUE;
        canvasData.data[index + RGBA_INDEXER.ALPHA] = rgbaPrimaryColor.ALPHA;
    }

    private findBorders(pixelsStack: Vec2[], currentPixel: Vec2): void {
        if (currentPixel.y - 1 >= 0) {
            pixelsStack.push({ x: currentPixel.x, y: currentPixel.y - 1 });
        }
        if (currentPixel.y + 1 < this.drawingService.canvas.height) {
            pixelsStack.push({ x: currentPixel.x, y: currentPixel.y + 1 });
        }
        if (currentPixel.x + 1 < this.drawingService.canvas.width) {
            pixelsStack.push({ x: currentPixel.x + 1, y: currentPixel.y });
        }
        if (currentPixel.x - 1 >= 0) {
            pixelsStack.push({ x: currentPixel.x - 1, y: currentPixel.y });
        }
    }

    private fillSameColor(): void {
        const pixelData = this.drawingService.getPixelData(this.mouseDownCoord);
        const canvasData = this.drawingService.getCanvasBaseData();

        for (let index = 0; index < canvasData.data.length; index += RGBA_LENGTH) {
            if (this.isInToleranceValue(pixelData, canvasData, index)) {
                this.setColor(index, canvasData);
            }
        }
        this.bucketAttributes.imageData = canvasData;
        this.drawingService.baseCtx.putImageData(canvasData, 0, 0);
        this.undoRedoPilesService.handlePiles(this.bucketAttributes);
    }

    protected toString(pixel: Vec2): string {
        return pixel.x.toString() + ',' + pixel.y.toString();
    }

    private isInToleranceValue(pixelData: Uint8ClampedArray, canvasData: ImageData, index: number): boolean {
        const red: number = Math.abs(pixelData[RGBA_INDEXER.RED] - canvasData.data[index + RGBA_INDEXER.RED]);
        const green: number = Math.abs(pixelData[RGBA_INDEXER.GREEN] - canvasData.data[index + RGBA_INDEXER.GREEN]);
        const blue: number = Math.abs(pixelData[RGBA_INDEXER.BLUE] - canvasData.data[index + RGBA_INDEXER.BLUE]);
        const alpha: number = Math.abs(pixelData[RGBA_INDEXER.ALPHA] - canvasData.data[index + RGBA_INDEXER.ALPHA]);

        let verify = false;
        const percentage: number = ((red + green + blue + alpha) / (RGBA_LENGTH * MAXIMUM_RGBA_VALUE)) * PERCENTAGE_100;
        percentage > this.bucketAttributes.tolerance.getValue() ? (verify = false) : (verify = true);

        return verify;
    }

    initializeAttributes(): void {
        this.bucketAttributes = {
            name: this.name,
            mainColor: this.colorService.primaryColor,
            secondaryColor: this.colorService.secondaryColor,
            thickness: 1,
            tolerance: new BehaviorSubject<number>(MIN_TOLERANCE),
            imageData: this.canvasImageData,
        };
    }

    setTolerance(tolerance: number): void {
        this.bucketAttributes.tolerance.next(tolerance);
    }

    getTolerance(): Observable<number> {
        return this.bucketAttributes.tolerance;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.initialPixelData = this.drawingService.getPixelData(this.mouseDownCoord);
        if (event.button === MouseButton.LEFT) {
            this.drawingService.baseCtx.fillStyle = this.colorService.primaryColor;
            this.contiguousFill();
        } else if (event.button === MouseButton.RIGHT) {
            this.fillSameColor();
        }
        this.drawingService.autoSave();
    }

    updateBucketAttributes(bucketAttributes: BucketAttributes): void {
        this.drawingService.baseCtx.putImageData(bucketAttributes.imageData, 0, 0);
    }
}
