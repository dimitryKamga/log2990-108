import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAX_TAGS_ALLOWED } from '@app/classes/constants/draw-constants';
import { ExportFormats } from '@app/classes/enums/export-enums';
import { SavingService } from '@app/services/modals/saving/saving.service';
import { TagFilterService } from '@app/services/modals/tag-filter/tag-filter.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';

@Component({
    selector: 'app-saving',
    templateUrl: './saving.component.html',
    styleUrls: ['./saving.component.scss'],
})
export class SavingComponent implements OnInit, OnDestroy {
    title: string;
    tags: Set<string>;
    tagName: string;
    isSaving: boolean;
    isTitleValid: boolean;

    format: string;
    exportFormats: string[];
    private formatsMap: Map<string, ExportFormats>;

    constructor(
        private dialogRef: MatDialogRef<SavingComponent>,
        private saveService: SavingService,
        private tagFilterService: TagFilterService,
        private snack: MatSnackBar,
        public shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        this.initialize();
    }

    private initialize(): void {
        this.tags = new Set<string>();
        this.tagName = '';
        this.isSaving = false;
        this.isTitleValid = false;
        this.formatsMap = new Map();
        this.formatsMap.set('PNG', ExportFormats.PNG);
        this.formatsMap.set('JPEG', ExportFormats.JPEG);
        this.exportFormats = Object.keys(ExportFormats);
    }

    private post(): void {
        this.snack.open('Début de la sauvegarde', '', { duration: 2000, panelClass: ['save'] });
        this.saveService.sendDrawing(this.title, this.tags);
    }

    ngOnInit(): void {
        this.saveService.isTitleValid.subscribe((validity: boolean) => {
            this.isTitleValid = validity;
        });
        this.saveService.currentFormat.subscribe((format: ExportFormats) => {
            this.format = format.toString();
        });
        this.shortcutsHandlerService.isShortcutKeyEnabled = false;
        this.dialogRef.disableClose = true;
    }

    ngOnDestroy(): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    resetSubscribers(): void {
        this.saveService.resetSubscribers();
    }

    removeTag(tag: string): void {
        this.tagFilterService.removeTag(tag, this.tags);
    }

    setTitle(event: InputEvent): void {
        if (event.target) {
            this.saveService.checkTitle((event.target as HTMLInputElement).value);
        }
    }
    setFormat(format: string): void {
        const newFormat = this.formatsMap.get(format);
        if (newFormat) {
            this.saveService.currentFormat.next(newFormat);
        }
    }
    save(): void {
        if (!this.isTitleValid) {
            this.snack.open('Titre invalide , tentez une nouvelle fois.', '', { duration: 2000, panelClass: ['warning'] });
        } else {
            this.isSaving = true;
            this.post();
            this.dialogRef.close();
        }
    }

    addTag(tag: string): void {
        if (this.tags.size < MAX_TAGS_ALLOWED) {
            if (this.tagFilterService.addTag(tag, this.tags)) {
                this.tagName = '';
            } else {
                this.snack.open('Étiquette invalide', '', { duration: 2000, panelClass: ['warning'] });
            }
        } else {
            this.snack.open('Vous ne pouvez pas ajouter plus de 6 étiquettes', '', { duration: 2000, panelClass: ['warning'] });
        }
    }
}
