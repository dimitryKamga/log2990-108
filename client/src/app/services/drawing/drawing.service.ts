import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;

    isLoaded: boolean;
    previousState: ImageData;
    canvasSize: HTMLCanvasElement;

    constructor() {
        this.isLoaded = false;
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    isCanvasBlank(context: CanvasRenderingContext2D): boolean {
        const blank = document.createElement('canvas');
        blank.width = context.canvas.width;
        blank.height = context.canvas.height;
        const blankCtx = blank.getContext('2d') as CanvasRenderingContext2D;

        blankCtx.fillStyle = 'white';
        blankCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        return context.canvas.toDataURL() === blankCtx.canvas.toDataURL();
    }

    getCanvasBaseData(): ImageData {
        return this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    handlePreviewCanvas(): void {
        this.baseCtx.drawImage(this.previewCanvas, 0, 0);
        this.clearCanvas(this.previewCtx);
    }

    getPixelData(pixelCoord: Vec2): Uint8ClampedArray {
        return this.baseCtx.getImageData(pixelCoord.x, pixelCoord.y, 1, 1).data;
    }
    autoSave(): void {
        localStorage.setItem('data', this.baseCtx.canvas.toDataURL());
        localStorage.setItem('width', this.baseCtx.canvas.width.toString());
        localStorage.setItem('height', this.baseCtx.canvas.height.toString());
    }

    setPixelColor(width: number, height: number): void {
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.fillRect(0, 0, width, height);
    }
}
