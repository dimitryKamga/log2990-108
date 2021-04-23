import { Injectable } from '@angular/core';
import { CarrouselAttributes } from '@app/classes/interfaces/tools-attributes';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MetaData } from '@common/communication/metadata';

@Injectable({
    providedIn: 'root',
})
export class CarrouselService {
    constructor(private drawingResizerService: DrawingResizerService, private drawingService: DrawingService) {}

    private drawDrawing(img: HTMLImageElement): void {
        this.drawingResizerService.resizeBaseCanvas(img.width, img.height);
        this.drawingService.baseCtx.drawImage(img, 0, 0, img.width, img.height);
        this.drawingService.autoSave();
    }

    onPrevious(imageIndexes: number[], metasFiltered: MetaData[]): void {
        imageIndexes[2] = imageIndexes[1];
        imageIndexes[1] = imageIndexes[0];
        imageIndexes[0] ? imageIndexes[0]-- : (imageIndexes[0] = metasFiltered.length - 1);
    }

    onNext(imageIndexes: number[], metasFiltered: MetaData[]): void {
        imageIndexes[0] = imageIndexes[1];
        imageIndexes[1] = imageIndexes[2];
        imageIndexes[2] === metasFiltered.length - 1 ? (imageIndexes[2] = 0) : imageIndexes[2]++;
    }

    loadImageOnCanvas(carrouselAttributes: CarrouselAttributes): void {
        const img = new Image();
        img.addEventListener('load', this.drawDrawing.bind(this, img));
        img.src = carrouselAttributes.image;
    }
}
