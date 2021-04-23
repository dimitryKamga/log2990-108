import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CONTAINER_MIN_HEIGHT, CONTAINER_MIN_WIDTH } from '@app/classes/constants/draw-constants';
import { ResizerLocation } from '@app/classes/enums/draw-enums';
import { Vec2 } from '@app/classes/vec2';
import { DrawingResizerService } from '@app/services/drawing/drawing-resizer/drawing-resizer.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-work-space',
    templateUrl: './work-space.component.html',
    styleUrls: ['./work-space.component.scss'],
})
export class WorkSpaceComponent implements AfterViewInit, AfterViewChecked {
    @ViewChild('drawingContainer', { static: false }) protected drawingContainer: ElementRef<HTMLDivElement>;

    resizerLocation: typeof ResizerLocation;
    private workSpaceSize: Vec2;

    constructor(
        private drawingResizerService: DrawingResizerService,
        private drawingService: DrawingService,
        private changeDetector: ChangeDetectorRef,
    ) {
        this.initialize();
    }

    ngAfterViewChecked(): void {
        this.changeDetector.detectChanges();
    }

    private initialize(): void {
        this.workSpaceSize = { x: CONTAINER_MIN_WIDTH, y: CONTAINER_MIN_HEIGHT };
        this.resizerLocation = ResizerLocation;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const workspaceElement: HTMLElement = this.drawingContainer.nativeElement;
            this.workSpaceSize = { x: workspaceElement.clientWidth, y: workspaceElement.getBoundingClientRect().height };
            this.drawingResizerService.workSpaceSize = this.workSpaceSize;
            this.drawingService.previousState = this.drawingService.getCanvasBaseData();
            if (localStorage.length === 0) {
                this.drawingResizerService.applyCanvasDefaultSize();
                this.drawingService.setPixelColor(this.drawingService.canvas.width, this.drawingService.canvas.height);
            }
        });
    }
    getResizerStyle(resizerLocation: ResizerLocation): string | undefined {
        return this.drawingResizerService.getResizerStyle(resizerLocation);
    }
}
