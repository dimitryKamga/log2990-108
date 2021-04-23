import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TOOLS_TABLE, TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { ToolLabels } from '@app/classes/interfaces/toolbar-interfaces';
import { ModalService } from '@app/services/modals/modal.service';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy, AfterViewChecked {
    private destroyed: Subject<boolean>;
    toolLabels: ToolLabels;
    currentTool: string;
    canUndo: boolean;
    canRedo: boolean;

    constructor(
        private toolManagementService: ToolManagementService,
        private modalService: ModalService,
        private undoRedoService: UndoRedoService,
        private undoRedoPiles: UndoRedoPilesService,
        private changeDetectorRef: ChangeDetectorRef,
        public router: Router,
    ) {
        this.initialize();
    }

    private initialize(): void {
        this.destroyed = new Subject<boolean>();
        this.toolLabels = TOOL_LABELS;
        this.currentTool = this.toolLabels.PENCIL;
        this.canUndo = false;
        this.canRedo = false;
    }

    ngOnInit(): void {
        this.toolManagementService
            .getSelectedTool()
            .pipe(takeUntil(this.destroyed))
            .subscribe((toolLabel) => {
                if (TOOLS_TABLE.includes(toolLabel)) {
                    this.currentTool = toolLabel;
                }
            });
    }
    ngAfterViewChecked(): void {
        const isUndoActive = this.undoRedoPiles.undoPile.length !== 0;
        const isRedoActive = this.undoRedoPiles.redoPile.length !== 0;
        if (isUndoActive !== this.canUndo) {
            this.canUndo = isUndoActive;
            this.changeDetectorRef.detectChanges();
        }
        if (isRedoActive !== this.canRedo) {
            this.canRedo = isRedoActive;
            this.changeDetectorRef.detectChanges();
        }
    }

    ngOnDestroy(): void {
        this.destroyed.next(true);
        this.destroyed.unsubscribe();
    }

    onToolSwitch(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.id) {
            this.toolManagementService.switchTool(target.id);
        }
    }

    newDrawing(): void {
        this.modalService.newDrawing();
    }

    openCarrouselModal(): void {
        this.modalService.openCarrouselModal();
    }
    openSavingModal(): void {
        this.modalService.openSavingModal();
    }
    openExportModal(): void {
        this.modalService.openExportModal();
    }
    undo(): void {
        this.undoRedoService.undo();
    }
    redo(): void {
        this.undoRedoService.redo();
    }
    goBack(): void {
        this.router.navigate(['/home']);
    }
}
