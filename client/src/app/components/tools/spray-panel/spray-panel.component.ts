import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SprayService } from '@app/services/tools/spray/spray.service';

@Component({
    selector: 'app-spray-panel',
    templateUrl: './spray-panel.component.html',
    styleUrls: ['./spray-panel.component.scss'],
})
export class SprayPanelComponent {
    sprayForm: FormGroup;
    name: string;
    jetDiameter: number;
    dropletDiameter: number;
    frequency: number;

    constructor(private sprayService: SprayService, private readonly formBuilder: FormBuilder) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.sprayService.name;
        this.jetDiameter = this.sprayService.sprayAttributes.jetDiameter;
        this.dropletDiameter = this.sprayService.sprayAttributes.dropletDiameter;
        this.frequency = this.sprayService.sprayAttributes.frequency;
        this.sprayForm = this.formBuilder.group({
            jetDiameterFormField: [this.sprayService.sprayAttributes.jetDiameter, [Validators.required]],
            dropletDiameterFormField: [this.sprayService.sprayAttributes.dropletDiameter, [Validators.required]],
            frequencyFormField: [this.sprayService.sprayAttributes.frequency, [Validators.required]],
        });
    }

    setJetDiameter(jetDiameter: number): void {
        this.sprayForm.patchValue({
            jetDiameterFormField: jetDiameter,
        });

        this.sprayService.setJetDiameter(jetDiameter);
    }

    setDropletDiameter(dropletDiameter: number): void {
        this.sprayForm.patchValue({
            dropletDiameterFormField: dropletDiameter,
        });

        this.sprayService.setDropletDiameter(dropletDiameter);
    }

    setFrequency(frequency: number): void {
        this.sprayForm.patchValue({
            frequencyFormField: frequency,
        });

        this.sprayService.setFrequency(frequency);
    }
}
