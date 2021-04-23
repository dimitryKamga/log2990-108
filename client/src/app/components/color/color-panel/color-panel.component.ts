import { Component } from '@angular/core';

@Component({
    selector: 'app-color-panel',
    templateUrl: './color-panel.component.html',
    styleUrls: ['./color-panel.component.scss'],
})
export class ColorPanelComponent {
    isExpanded: boolean;

    constructor() {
        this.isExpanded = false;
    }
}
