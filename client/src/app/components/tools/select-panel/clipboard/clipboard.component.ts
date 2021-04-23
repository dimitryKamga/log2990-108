import { AfterViewChecked, ChangeDetectorRef, Component } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { SelectService } from '@app/services/tools/selection/select/select.service';

@Component({
    selector: 'app-clipboard',
    templateUrl: './clipboard.component.html',
    styleUrls: ['./clipboard.component.scss'],
})
export class ClipboardComponent implements AfterViewChecked {
    name: string;

    canCopy: boolean;
    canPaste: boolean;
    canCut: boolean;
    canDelete: boolean;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private selectRectangleService: SelectRectangleService,
        private selectEllipseService: SelectEllipseService,
        private toolManagementService: ToolManagementService,
        private selectLassoService: SelectLassoService,
    ) {
        this.initializeAttributes();
    }

    private initializeAttributes(): void {
        this.canCopy = false;
        this.canPaste = false;
        this.canCut = false;
        this.canDelete = false;
    }

    ngAfterViewChecked(): void {
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION) {
            this.handleSelectionType(this.selectRectangleService);
        }

        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION) {
            this.handleSelectionType(this.selectEllipseService);
        }

        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.LASSO) {
            this.handleSelectionType(this.selectLassoService);
        }
    }

    handleSelectionType(service: SelectService): void {
        if (service.isSelected) {
            service.canCut = service.isSelected;
            service.canDelete = service.isSelected;
            service.canCopy = service.isSelected;
            this.changeDetectorRef.detectChanges();
        }

        this.canCut = service.canCut;
        this.canDelete = service.canDelete;
        this.canCopy = service.canCopy;
        this.canPaste = service.canPaste;
        this.changeDetectorRef.detectChanges();

        if (service.isCut) {
            this.canDelete = false;
            this.canCut = false;
            this.canCopy = false;
            this.changeDetectorRef.detectChanges();
        }
        if (service.movePaste) {
            this.canDelete = false;
            this.canCut = false;
            this.canCopy = false;
            this.changeDetectorRef.detectChanges();
        }
    }

    copy(): void {
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION) {
            this.selectRectangleService.copy();
        }
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION) {
            this.selectEllipseService.copy();
        }

        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.LASSO) {
            this.selectLassoService.copy();
        }
    }
    paste(): void {
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION) {
            this.selectRectangleService.paste();
        }
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION) {
            this.selectEllipseService.paste();
        }

        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.LASSO) {
            this.selectLassoService.paste();
        }
    }
    cut(): void {
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION) {
            this.selectRectangleService.cut();
        }
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION) {
            this.selectEllipseService.cut();
        }
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.LASSO) {
            this.selectLassoService.cut();
        }
    }
    delete(): void {
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.RECTANGLE_SELECTION) {
            this.selectRectangleService.delete();
        }
        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.ELLIPSE_SELECTION) {
            this.selectEllipseService.delete();
        }

        if (this.toolManagementService.getSelectedToolName() === TOOL_LABELS.LASSO) {
            this.selectLassoService.delete();
        }
    }
}
