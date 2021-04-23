import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { CarrouselComponent } from '@app/components/modals/carrousel/carrousel.component';
import { ExportComponent } from '@app/components/modals/export/export.component';
import { SavingComponent } from '@app/components/modals/saving/saving.component';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    constructor(private dialog: MatDialog, private drawingService: DrawingService, private snack: MatSnackBar) {}

    private warningSnack(): void {
        this.snack.open('Dessin Vide , Veuillez Dessiner.', '', { duration: 2000, panelClass: ['warning'] });
    }
    newDrawing(): void {
        if (!this.drawingService.isCanvasBlank(this.drawingService.baseCtx)) {
            this.dialog.open(ConfirmationDialogComponent);
        } else {
            this.warningSnack();
        }
    }
    openSavingModal(): void {
        if (!this.drawingService.isCanvasBlank(this.drawingService.baseCtx)) {
            this.dialog.open(SavingComponent);
        } else {
            this.warningSnack();
        }
    }
    openExportModal(): void {
        if (!this.drawingService.isCanvasBlank(this.drawingService.baseCtx)) {
            this.dialog.open(ExportComponent);
        } else {
            this.warningSnack();
        }
    }
    openCarrouselModal(): void {
        this.dialog.open(CarrouselComponent);
    }
}
