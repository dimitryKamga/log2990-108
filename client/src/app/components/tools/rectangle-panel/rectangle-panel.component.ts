import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RectangleService } from '@app/services/tools/shape/rectangle/rectangle.service';

@Component({
    selector: 'app-rectangle-panel',
    templateUrl: './rectangle-panel.component.html',
    styleUrls: ['./rectangle-panel.component.scss'],
})
export class RectanglePanelComponent {
    rectangleForm: FormGroup;
    name: string;
    thickness: number;
    style: number;

    constructor(private rectangleService: RectangleService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.rectangleService.name;
        this.thickness = this.rectangleService.rectangleAttributes.thickness;
        this.style = this.rectangleService.rectangleAttributes.style;
        this.rectangleForm = this.formBuilder.group({
            thicknessFormField: [this.rectangleService.rectangleAttributes.thickness, [Validators.required]],
        });
    }

    setThickness(thickness: number): void {
        this.rectangleForm.patchValue({
            thicknessFormField: thickness,
        });

        this.rectangleService.setThickness(thickness);
    }

    setStyle(style: number): void {
        this.rectangleService.setStyle(style);
    }
}
