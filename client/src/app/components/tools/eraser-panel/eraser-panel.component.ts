import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EraserService } from '@app/services/tools/eraser/eraser.service';

@Component({
    selector: 'app-eraser-panel',
    templateUrl: './eraser-panel.component.html',
    styleUrls: ['./eraser-panel.component.scss'],
})
export class EraserPanelComponent {
    eraserForm: FormGroup;
    thickness: number;
    name: string;

    constructor(private eraserService: EraserService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.eraserService.name;
        this.thickness = this.eraserService.eraserAttributes.thickness;
        this.eraserForm = this.formBuilder.group({ thicknessFormField: [this.eraserService.eraserAttributes.thickness, [Validators.required]] });
    }

    setThickness(thickness: number): void {
        this.eraserForm.patchValue({
            thicknessFormField: thickness,
        });
        this.eraserService.setThickness(thickness);
    }
}
