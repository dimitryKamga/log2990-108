import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LineService } from '@app/services/tools/line/line.service';

@Component({
    selector: 'app-line-panel',
    templateUrl: './line-panel.component.html',
    styleUrls: ['./line-panel.component.scss'],
})
export class LinePanelComponent {
    @ViewChild('slideToggle', {})
    protected slideToggle: MatSlideToggle;

    lineForm: FormGroup;
    thickness: number;
    dotRadius: number;
    isJunction: boolean;
    name: string;

    constructor(private lineService: LineService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.thickness = this.lineService.lineAttributes.thickness;
        this.dotRadius = this.lineService.lineAttributes.dotRadius;
        this.isJunction = this.lineService.lineAttributes.isJunction;
        this.name = this.lineService.name;
        this.lineForm = this.formBuilder.group({
            thicknessFormField: [this.lineService.lineAttributes.thickness, [Validators.required]],
            junctionFormField: [this.lineService.lineAttributes.dotRadius, [Validators.required]],
        });
    }

    setDotRadius(radius: number): void {
        this.lineForm.patchValue({
            junctionFormField: radius,
        });
        this.lineService.updateDotRadius(radius);
    }

    setThickness(thickness: number): void {
        this.lineForm.patchValue({
            thicknessFormField: thickness,
        });
        this.lineService.updateThickness(thickness);
    }

    onChangeJonctionOption($event: MatSlideToggleChange): void {
        this.isJunction = $event.checked;
        this.lineService.updateJunction($event.checked);
    }
}
