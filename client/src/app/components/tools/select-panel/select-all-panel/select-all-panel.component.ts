import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { FEATURES_SIDEBAR, TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';

@Component({
    selector: 'app-select-all-panel',
    templateUrl: './select-all-panel.component.html',
    styleUrls: ['./select-all-panel.component.scss'],
})
export class SelectAllPanelComponent implements AfterViewChecked {
    name: string;
    isPressed: boolean;

    constructor(
        private selectRectangleService: SelectRectangleService,
        private toolManagementService: ToolManagementService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.initialize();
    }

    private initialize(): void {
        this.name = FEATURES_SIDEBAR.SELECT_ALL_LABEL;
        this.isPressed = true;
    }

    ngAfterViewChecked(): void {
        this.isPressed = this.selectRectangleService.isSelectAll;
        this.changeDetectorRef.detectChanges();
    }

    selectAll(): void {
        if (this.isPressed) {
            this.selectRectangleService.selectAll();
        } else {
            this.toolManagementService.resetTools(TOOL_LABELS.RECTANGLE_SELECTION);
        }
    }
}
