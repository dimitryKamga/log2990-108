import { Component, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { GridService } from '@app/services/grid/grid.service';

@Component({
    selector: 'app-grid-panel',
    templateUrl: './grid-panel.component.html',
    styleUrls: ['./grid-panel.component.scss'],
})
export class GridPanelComponent {
    @ViewChild('activeToggle', {
        static: false,
        read: MatSlideToggle,
    })
    private activeToggleRef: MatSlideToggle;
    opacity: number;
    squareSize: number;
    gridForm: FormGroup;

    constructor(private readonly formBuilder: FormBuilder, public gridService: GridService) {
        this.initialize();
    }

    private initialize(): void {
        this.opacity = this.gridService.opacity;
        this.squareSize = this.gridService.squareSize;
        this.gridForm = this.formBuilder.group({
            activeToggleForm: [this.gridService.isEnabled, []],
            squareSizeFormField: [this.gridService.squareSize, [Validators.required]],
            opacityFormField: [this.gridService.opacity, [Validators.required]],
        });
    }

    setSquaresize(squareSize: number): void {
        this.gridForm.patchValue({
            squareSizeFormField: squareSize,
        });
        this.gridService.changeSquareSize(squareSize);
    }

    setOpacity(value: number): void {
        this.gridForm.patchValue({
            opacityFormField: value,
        });
        this.gridService.changeOpacity(value);
    }

    setGridEnabler(): void {
        this.gridForm.patchValue({
            activeToggleForm: this.activeToggleRef.checked,
        });
        this.gridService.isEnabled = this.activeToggleRef.checked;
        this.gridService.gridHandler();
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (this.gridService.isEnabled) {
            this.gridService.keyboardHandler(event.key);
            this.gridForm.patchValue({
                squareSizeFormField: this.gridService.squareSize,
            });
        }
    }
}
