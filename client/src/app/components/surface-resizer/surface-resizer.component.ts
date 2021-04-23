import { Component, HostListener, Input } from '@angular/core';
import { ResizerLocation } from '@app/classes/enums/draw-enums';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';

@Component({
    selector: 'app-surface-resizer',
    templateUrl: './surface-resizer.component.html',
    styleUrls: ['./surface-resizer.component.scss'],
})
export class SurfaceResizerComponent {
    @Input() resizerLocation: ResizerLocation;
    constructor(private drawingResizerService: DrawingResizerService) {
        this.resizerLocation = ResizerLocation.NONE;
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.drawingResizerService.onMouseDown(event);
        this.drawingResizerService.resizerLocation = this.resizerLocation;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.drawingResizerService.onMouseMove(event);
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        this.drawingResizerService.onMouseUp();
    }
}
