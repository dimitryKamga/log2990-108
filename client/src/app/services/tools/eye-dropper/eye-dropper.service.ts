import { EventEmitter, Injectable } from '@angular/core';
import {
    ALPHA_POSITION,
    CANVAS_HEIGHT_TO_CLEAR,
    CANVAS_WIDTH_TO_CLEAR,
    HEX_BASE,
    MAX_ALPHA,
    OCT_BASE,
    PIXEL_HEIGHT,
    PIXEL_VISUALIZER_HEIGHT,
    PIXEL_VISUALIZER_WIDTH,
    PIXEL_VISUALIZER_X_COORDINATE,
    PIXEL_VISUALIZER_Y_COORDINATE,
    PIXEL_WIDTH,
    RECTANGLE_TO_ZOOM_DIMENSION,
    SLICE_VALUE,
    ZOOMED_RECTANGLE_HEIGHT,
    ZOOMED_RECTANGLE_WIDTH,
} from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { MouseButton } from '@app/classes/enums/draw-enums';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class EyedropperService extends Tool {
    name: string;
    pixel: ImageData;
    canvas: HTMLCanvasElement;
    baseCtx: CanvasRenderingContext2D;
    primaryColor: EventEmitter<string>;
    secondaryColor: EventEmitter<string>;
    primaryOpacity: EventEmitter<number>;
    secondaryOpacity: EventEmitter<number>;
    showVisualisationPanel: boolean;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.initializeAttributes();
    }

    initializeAttributes(): void {
        this.name = TOOL_LABELS.EYE_DROPPER;
        this.showVisualisationPanel = false;
        this.primaryColor = new EventEmitter<string>();
        this.secondaryColor = new EventEmitter<string>();
        this.primaryOpacity = new EventEmitter<number>();
        this.secondaryOpacity = new EventEmitter<number>();
    }

    private drawVisualisationCircle(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.baseCtx.imageSmoothingEnabled = false;
        this.baseCtx.clearRect(0, 0, CANVAS_WIDTH_TO_CLEAR, CANVAS_HEIGHT_TO_CLEAR);
        this.baseCtx.drawImage(
            this.drawingService.canvas,
            mousePosition.x - RECTANGLE_TO_ZOOM_DIMENSION / 2,
            mousePosition.y - RECTANGLE_TO_ZOOM_DIMENSION / 2,
            RECTANGLE_TO_ZOOM_DIMENSION,
            RECTANGLE_TO_ZOOM_DIMENSION,
            0,
            0,
            ZOOMED_RECTANGLE_WIDTH,
            ZOOMED_RECTANGLE_HEIGHT,
        );
        this.baseCtx.lineWidth = 1;
        this.baseCtx.strokeStyle = 'black';
        this.baseCtx.strokeRect(
            PIXEL_VISUALIZER_X_COORDINATE / 2,
            PIXEL_VISUALIZER_Y_COORDINATE / 2,
            PIXEL_VISUALIZER_WIDTH,
            PIXEL_VISUALIZER_HEIGHT,
        );
    }
    private rgbToHex(r: number, g: number, b: number): string {
        return (r * Math.pow(2, HEX_BASE) + g * Math.pow(2, OCT_BASE) + b).toString(HEX_BASE);
    }

    private getPixelColor(event: MouseEvent): string {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.pixel = this.drawingService.baseCtx.getImageData(
            this.mouseDownCoord.x - PIXEL_WIDTH / 2,
            this.mouseDownCoord.y - PIXEL_HEIGHT / 2,
            PIXEL_WIDTH,
            PIXEL_HEIGHT,
        );
        let color = '#' + ('000000' + this.rgbToHex(this.pixel.data[0], this.pixel.data[1], this.pixel.data[2])).slice(SLICE_VALUE);
        if (color === '#000000') {
            color = '#ffffff';
        }
        return color;
    }
    private getPixelOpacity(event: MouseEvent, color: string): number {
        let opacity: number;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.pixel = this.drawingService.baseCtx.getImageData(
            this.mouseDownCoord.x - PIXEL_WIDTH / 2,
            this.mouseDownCoord.y - PIXEL_HEIGHT / 2,
            PIXEL_WIDTH,
            PIXEL_HEIGHT,
        );

        color === '#ffffff' ? (opacity = 1) : (opacity = this.pixel.data[ALPHA_POSITION] / MAX_ALPHA);

        return opacity;
    }

    onMouseDown(event: MouseEvent): void {
        if (event.button === MouseButton.LEFT) {
            const color = this.getPixelColor(event);
            this.primaryColor.emit(color);
            const opacity = this.getPixelOpacity(event, color);
            this.primaryOpacity.emit(opacity);
        }

        if (event.button === MouseButton.RIGHT) {
            const color = this.getPixelColor(event);
            this.secondaryColor.emit(color);
            const opacity = this.getPixelOpacity(event, color);
            this.secondaryOpacity.emit(opacity);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.showVisualisationPanel = true;
        this.drawVisualisationCircle(event);
    }

    onMouseLeave(): void {
        this.showVisualisationPanel = false;
    }
}
