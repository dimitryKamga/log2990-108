import { Component } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { ToolLabels } from '@app/classes/interfaces/toolbar-interfaces';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';

@Component({
    selector: 'app-tool-panel',
    templateUrl: './tool-panel.component.html',
    styleUrls: ['./tool-panel.component.scss'],
})
export class ToolPanelComponent {
    toolLabels: ToolLabels;
    constructor(public toolManagementService: ToolManagementService) {
        this.toolLabels = TOOL_LABELS;
    }
}
