import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';

@Component({
    selector: 'app-load-confirmation-dialog',
    templateUrl: './load-confirmation-dialog.component.html',
    styleUrls: ['./load-confirmation-dialog.component.scss'],
})
export class LoadConfirmationDialogComponent implements OnInit, OnDestroy {
    readonly title: string = 'Confirmer votre choix';
    readonly question: string = "Un dessin est actuellement en cours. Voulez-vous toujours ajouter l'image sur le canvas?";
    readonly confirm: string = 'Continuer quand même';
    readonly cancel: string = 'Annuler';

    constructor(private shortcutsHandlerService: ShortcutsHandlerService, private dialogRef: MatDialogRef<LoadConfirmationDialogComponent>) {}

    ngOnInit(): void {
        this.dialogRef.disableClose = true;
        this.shortcutsHandlerService.isShortcutKeyEnabled = false;
    }

    ngOnDestroy(): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    drawImage(): void {
        this.dialogRef.close('confirm');
    }
}
