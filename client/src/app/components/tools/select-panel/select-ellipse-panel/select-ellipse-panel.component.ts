import { Component } from '@angular/core';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';

@Component({
    selector: 'app-select-ellipse-panel',
    templateUrl: './select-ellipse-panel.component.html',
    styleUrls: ['./select-ellipse-panel.component.scss'],
})
export class SelectEllipsePanelComponent {
    name: string;

    constructor(private selectEllipseService: SelectEllipseService) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.selectEllipseService.name;
    }
}
