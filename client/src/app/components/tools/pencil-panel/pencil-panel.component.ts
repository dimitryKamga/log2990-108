import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PencilService } from '@app/services/tools/pencil/pencil.service';

@Component({
    selector: 'app-pencil-panel',
    templateUrl: './pencil-panel.component.html',
    styleUrls: ['./pencil-panel.component.scss'],
})
export class PencilPanelComponent {
    pencilForm: FormGroup;
    thickness: number;
    name: string;

    constructor(private pencilService: PencilService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.pencilService.name;
        this.thickness = this.pencilService.pencilAttributes.thickness;
        this.pencilForm = this.formBuilder.group({ thicknessFormField: [this.pencilService.pencilAttributes.thickness, [Validators.required]] });
    }

    setThickness(thickness: number): void {
        this.pencilForm.patchValue({
            thicknessFormField: thickness,
        });

        this.pencilService.setThickness(thickness);
    }
}
