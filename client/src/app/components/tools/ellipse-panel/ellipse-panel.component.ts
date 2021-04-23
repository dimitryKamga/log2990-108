import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EllipseService } from '@app/services/tools/shape/ellipse/ellipse.service';

@Component({
    selector: 'app-ellipse-panel',
    templateUrl: './ellipse-panel.component.html',
    styleUrls: ['./ellipse-panel.component.scss'],
})
export class EllipsePanelComponent {
    ellipseForm: FormGroup;
    thickness: number;
    name: string;
    style: number;

    constructor(private ellipseService: EllipseService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.ellipseService.name;
        this.thickness = this.ellipseService.ellipseAttributes.thickness;
        this.style = this.ellipseService.ellipseAttributes.style;
        this.ellipseForm = this.formBuilder.group({
            thicknessFormField: [this.ellipseService.ellipseAttributes.thickness, [Validators.required]],
        });
    }

    setThickness(thickness: number): void {
        this.ellipseForm.patchValue({
            thicknessFormField: thickness,
        });
        this.ellipseService.setThickness(thickness);
    }

    setStyle(style: number): void {
        this.ellipseService.setStyle(style);
    }
}
