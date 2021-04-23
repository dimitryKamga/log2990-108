import { Component } from '@angular/core';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';

@Component({
    selector: 'app-select-rectangle-panel',
    templateUrl: './select-rectangle-panel.component.html',
    styleUrls: ['./select-rectangle-panel.component.scss'],
})
export class SelectRectanglePanelComponent {
    name: string;

    constructor(private selectRectangleService: SelectRectangleService) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.selectRectangleService.name;
    }
}
