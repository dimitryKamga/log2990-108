import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { EyedropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';

@Component({
    selector: 'app-eye-dropper-panel',
    templateUrl: './eye-dropper-panel.component.html',
    styleUrls: ['./eye-dropper-panel.component.scss'],
})
export class EyedropperPanelComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) protected baseCanvas: ElementRef<HTMLCanvasElement>;

    name: string;
    private baseCtx: CanvasRenderingContext2D;

    constructor(private eyedropperService: EyedropperService) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.eyedropperService.name;
    }

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.eyedropperService.baseCtx = this.baseCtx;
        this.eyedropperService.canvas = this.baseCanvas.nativeElement;
    }

    getVisualisationPanelStatut(): boolean {
        return this.eyedropperService.showVisualisationPanel;
    }
}
