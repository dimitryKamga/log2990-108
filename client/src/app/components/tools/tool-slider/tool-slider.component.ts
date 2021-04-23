import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';

@Component({
    selector: 'app-tool-slider',
    templateUrl: './tool-slider.component.html',
    styleUrls: ['./tool-slider.component.scss'],
})
export class ToolSliderComponent {
    @Input() name: string;
    @Input() min: number;
    @Input() max: number;
    @Input() value: number;
    @Input() step: number;

    @Output() valueChange: EventEmitter<number | null> = new EventEmitter<number | null>();

    onValueChange(event: MatSliderChange): void {
        this.valueChange.emit(event.value);
    }
}
