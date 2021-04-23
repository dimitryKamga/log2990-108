import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';

@Component({
    selector: 'app-polygon-panel',
    templateUrl: './polygon-panel.component.html',
    styleUrls: ['./polygon-panel.component.scss'],
})
export class PolygonPanelComponent {
    polygonForm: FormGroup;
    name: string;
    thickness: number;
    style: number;
    nbSides: number;

    constructor(private polygonService: PolygonService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.polygonService.name;
        this.thickness = this.polygonService.polygonAttributes.thickness;
        this.style = this.polygonService.polygonAttributes.style;
        this.nbSides = this.polygonService.polygonAttributes.numberOfSides;
        this.polygonForm = this.formBuilder.group({
            thicknessFormField: [this.polygonService.polygonAttributes.thickness, [Validators.required]],
            nbSidesFormField: [this.polygonService.polygonAttributes.numberOfSides, [Validators.required]],
        });
    }

    setThickness(thickness: number): void {
        this.polygonForm.patchValue({
            thicknessFormField: thickness,
        });
        this.polygonService.setThickness(thickness);
    }

    setStyle(style: number): void {
        this.polygonService.setStyle(style);
    }

    setSides(sides: number): void {
        this.polygonForm.patchValue({
            nbSidesFormField: sides,
        });
        this.polygonService.setSides(sides);
    }
}
