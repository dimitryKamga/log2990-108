import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { EventManager } from '@angular/platform-browser';
import { Directions } from '@app/classes/enums/select-enums';
import { MagnetService } from '@app/services/magnet/magnet.service';

@Component({
    selector: 'app-magnetism-panel',
    templateUrl: './magnetism-panel.component.html',
    styleUrls: ['./magnetism-panel.component.scss'],
})
export class MagnetismPanelComponent implements AfterViewInit {
    @ViewChild('slideToggle', {})
    protected slideToggle: MatSlideToggle;

    @ViewChild('previewCircle', {
        static: false,
    })
    private previewCircle: ElementRef<HTMLCanvasElement>;

    @ViewChild('circles', {
        static: false,
        read: ElementRef,
    })
    private circles: ElementRef<HTMLCanvasElement>;

    anchor: Directions;
    isEnabled: boolean;

    constructor(public magnetService: MagnetService, private renderer: Renderer2, private event: EventManager) {
        this.initialize();
    }

    private initialize(): void {
        this.isEnabled = this.magnetService.isEnabled;
    }

    private setAnchor(circle: HTMLCanvasElement): void {
        const cx = circle.getAttribute('cx') as string;
        const cy = circle.getAttribute('cy') as string;
        this.renderer.setAttribute(this.previewCircle.nativeElement, 'cx', cx);
        this.renderer.setAttribute(this.previewCircle.nativeElement, 'cy', cy);
    }

    enableMagnet($event: MatSlideToggleChange): void {
        this.isEnabled = $event.checked;
        this.magnetService.enableMagnet($event.checked);
    }

    ngAfterViewInit(): void {
        const buttons = Array.from(this.circles.nativeElement.children) as HTMLCanvasElement[];
        this.setAnchor(buttons[this.magnetService.anchor as number]);
        for (const [index, circle] of buttons.entries()) {
            this.event.addEventListener((circle as unknown) as HTMLElement, 'click', () => {
                this.magnetService.anchor = index;
                this.setAnchor(circle as HTMLCanvasElement);
            });
            this.renderer.setStyle(circle, 'cursor', 'pointer');
        }
    }
}
