import { Component } from '@angular/core';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';

@Component({
    selector: 'app-select-lasso-panel',
    templateUrl: './select-lasso-panel.component.html',
    styleUrls: ['./select-lasso-panel.component.scss'],
})
export class SelectLassoPanelComponent {
    name: string;

    constructor(private selectLassoService: SelectLassoService) {
        this.initialize();
    }

    private initialize(): void {
        this.name = this.selectLassoService.name;
    }
}
