import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ResetDrawingService } from '@app/services/drawing/reset-drawing/reset-drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
    readonly title: string = 'Confirmer votre choix';
    readonly question: string = 'Un dessin est actuellement en cours.';
    readonly confirm: string = 'Créer quand même';
    readonly cancel: string = 'Annuler';

    constructor(
        private shortcutsHandlerService: ShortcutsHandlerService,
        private confirmationDialogService: ResetDrawingService,
        private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    ) {}

    ngOnInit(): void {
        this.dialogRef.disableClose = true;
        this.shortcutsHandlerService.isShortcutKeyEnabled = false;
    }

    resetDrawing(response: boolean): void {
        this.confirmationDialogService.resetDrawing(response);
    }

    ngOnDestroy(): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }
}
