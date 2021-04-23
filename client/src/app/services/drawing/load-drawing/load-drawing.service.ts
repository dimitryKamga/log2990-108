import { Injectable } from '@angular/core';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class LoadDrawingService {
    constructor(private drawingService: DrawingService, private drawingResizerService: DrawingResizerService) {}

    private loadDrawing(source: string): void {
        const img = new Image();
        img.addEventListener('load', this.draw.bind(this, img));
        img.src = source;
    }

    private draw(img: HTMLImageElement): void {
        const width = Number(localStorage.getItem('width') as string);
        const height = Number(localStorage.getItem('height') as string);

        this.drawingResizerService.resizeBaseCanvas(width, height);

        this.drawingService.baseCtx.drawImage(img, 0, 0, width, height);
        this.drawingService.isLoaded = true;
        this.drawingService.autoSave();
    }

    loadPreviousDrawing(): void {
        const source = localStorage.getItem('data') as string;
        const width = Number(localStorage.getItem('width') as string);
        const height = Number(localStorage.getItem('height') as string);

        this.drawingResizerService.canvasSize.x = width;
        this.drawingResizerService.canvasSize.y = height;

        this.drawingResizerService.resizingLayerSize.x = width;
        this.drawingResizerService.resizingLayerSize.y = height;

        this.drawingService.setPixelColor(width, height);
        this.loadDrawing(source);
    }
}
