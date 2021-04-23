import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExportFilters, ExportFormats, ExportModes } from '@app/classes/enums/export-enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from '@app/services/modals/export/export.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
})
export class ExportComponent implements OnInit, OnDestroy, AfterViewInit {
    exportFormats: string[];
    exportFilters: string[];
    exportModes: string[];

    format: string;
    filter: string;
    exportMode: string;
    title: string;
    imagesrc: string;

    isTitleValid: boolean;
    isEmailValid: boolean;

    private formatsMap: Map<string, ExportFormats>;
    private filtersMap: Map<string, ExportFilters>;
    private exportModeMap: Map<string, ExportModes>;

    constructor(
        private exportService: ExportService,
        private snack: MatSnackBar,
        private shortcutsHandlerService: ShortcutsHandlerService,
        private dialogRef: MatDialogRef<ExportComponent>,
        private drawingService: DrawingService,
    ) {}

    private initializeMaps(): void {
        this.formatsMap = new Map();
        this.formatsMap.set('JPEG', ExportFormats.JPEG);
        this.formatsMap.set('PNG', ExportFormats.PNG);

        this.filtersMap = new Map();
        this.filtersMap = new Map();
        this.filtersMap.set('AUCUN', ExportFilters.AUCUN);
        this.filtersMap.set('SEPIA', ExportFilters.SEPIA);
        this.filtersMap.set('INVERSION', ExportFilters.INVERSION);
        this.filtersMap.set('CONTRASTE', ExportFilters.CONTRASTE);
        this.filtersMap.set('GRAYSCALE', ExportFilters.GRAYSCALE);
        this.filtersMap.set('ROTATION', ExportFilters.ROTATION);

        this.exportModeMap = new Map();
        this.exportModeMap.set('EXPORTER', ExportModes.EXPORTER);
        this.exportModeMap.set('TELEVERSER', ExportModes.TELEVERSER);
    }

    ngOnInit(): void {
        this.isTitleValid = false;
        this.dialogRef.disableClose = true;
        this.initializeMaps();

        this.exportService.currentFormat.subscribe((format: ExportFormats) => {
            this.format = format.toString();
        });
        this.exportService.currentFilter.subscribe((filter: ExportFilters) => {
            this.filter = filter.toString();
        });
        this.exportService.currentExportMode.subscribe((mode: ExportModes) => {
            this.exportMode = mode.toString();
        });
        this.exportService.isTitleValid.subscribe((validity: boolean) => {
            this.isTitleValid = validity;
        });

        this.exportFormats = Object.keys(ExportFormats);
        this.exportFilters = Object.keys(ExportFilters);
        this.exportModes = Object.keys(ExportModes);

        this.shortcutsHandlerService.isShortcutKeyEnabled = false;
    }

    ngOnDestroy(): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.imagesrc = this.drawingService.canvas.toDataURL();
            this.exportService.urlImage.src = this.imagesrc;
            this.exportService.applyFilter();
        });
    }

    resetSubscribers(): void {
        this.exportService.resetSubscribers();
    }

    setTitle(event: InputEvent): void {
        if (event.target) {
            this.exportService.checkTitle((event.target as HTMLInputElement).value);
        }
    }

    setFilter(filter: string): void {
        const newFilter = this.filtersMap.get(filter);
        if (newFilter) {
            this.exportService.currentFilter.next(newFilter);
            this.exportService.applyFilter();
            this.imagesrc = this.exportService.urlImage.src;
        }
    }

    setFormat(format: string): void {
        const newFormat = this.formatsMap.get(format);
        if (newFormat) {
            this.exportService.currentFormat.next(newFormat);
        }
    }

    setExportMode(exportMode: string): void {
        const newExportMode = this.exportModeMap.get(exportMode);
        if (newExportMode) {
            this.exportService.currentExportMode.next(newExportMode);
        }
    }

    exportConfirmation(): void {
        if (!this.isTitleValid) {
            this.snack.open('Titre invalide , tentez une nouvelle fois.', '', { duration: 2000, panelClass: ['warning'] });
        } else {
            switch (this.exportMode) {
                case ExportModes.TELEVERSER:
                    this.exportService.upload(this.title);
                    break;
                default:
                    this.exportService.export(this.title);
            }
            this.dialogRef.close();
        }
    }
}
