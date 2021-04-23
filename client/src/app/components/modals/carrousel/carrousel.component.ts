import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MAX_NUMBER_IMAGES } from '@app/classes/constants/draw-constants';
import { FEATURES_SIDEBAR } from '@app/classes/constants/toolbar-constants';
import { CarrouselAttributes } from '@app/classes/interfaces/tools-attributes';
import { LoadConfirmationDialogComponent } from '@app/components/modals/carrousel/load-confirmation-dialog/load-confirmation-dialog.component';
import { TagFilterComponent } from '@app/components/modals/tag-filter/tag-filter.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { CarrouselService } from '@app/services/modals/carrousel/carrousel.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { MetaData } from '@common/communication/metadata';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (subscribe)

@Component({
    selector: 'app-carrousel',
    templateUrl: './carrousel.component.html',
    styleUrls: ['./carrousel.component.scss'],
})
export class CarrouselComponent implements OnInit, OnDestroy {
    @ViewChild(TagFilterComponent) protected tagFilterComponent: TagFilterComponent;

    carrouselAttributes: CarrouselAttributes;
    hasDrawings: boolean;
    imageIndexes: number[];
    metasDatabase: MetaData[];
    metasFiltered: MetaData[];
    indexOfInterest: number;
    path: string;

    readonly BASE_URL: string = 'http://localhost:3000/api/database/getDrawing/';

    private destroyed: Subject<boolean>;

    constructor(
        private dialogRef: MatDialogRef<CarrouselComponent>,
        private dialog: MatDialog,
        private shortcutsHandlerService: ShortcutsHandlerService,
        private indexService: IndexService,
        private drawingService: DrawingService,
        private snack: MatSnackBar,
        private carrouselService: CarrouselService,
        private router: Router,
    ) {
        this.initialize();
    }

    private initialize(): void {
        this.hasDrawings = false;
        this.imageIndexes = [];
        this.metasDatabase = [];
        this.metasFiltered = [];
        this.indexOfInterest = 0;
        this.path = '/home';
        this.destroyed = new Subject<boolean>();
        this.carrouselAttributes = {
            name: FEATURES_SIDEBAR.CARROUSEL_LABEL,
            image: '',
            mainColor: 'white',
            thickness: 1,
            secondaryColor: '',
        };
    }

    private getDatabaseData(): void {
        this.hasDrawings = false;
        this.imageIndexes = [];
        this.metasDatabase = [];
        this.indexService
            .getMetaData()
            .pipe(takeUntil(this.destroyed))
            .subscribe(
                (metaData: MetaData[]) => {
                    this.hasDrawings = true;
                    this.metasDatabase = metaData;
                    this.metasFiltered = this.metasDatabase;
                    this.previewFilteredImages();
                },
                () => {
                    this.snack.open('Une erreur est survenue lors du chargement des images.', '', { duration: 7000, panelClass: ['warning'] });
                },
            );
    }

    private applyImageOfInterest(index: number): void {
        if (this.path === '/home') {
            this.router.navigateByUrl('/editor');
            this.path = '/editor';
        }
        this.indexService
            .getDrawing(this.metasFiltered[index].filename)
            .pipe(takeUntil(this.destroyed))
            .subscribe(
                (image: Blob) => {
                    const img = URL.createObjectURL(image);
                    this.loadImageOnCanvas(img);
                },
                () => {
                    this.snack.open("Une erreur est survenue lors du chargement de l'image.", '', { duration: 2000, panelClass: ['warning'] });
                },
            );
    }

    private loadImageOnCanvas(drawing: string): void {
        this.carrouselAttributes.image = drawing;
        this.carrouselService.loadImageOnCanvas(this.carrouselAttributes);
    }

    ngOnInit(): void {
        this.dialogRef.disableClose = true;
        this.shortcutsHandlerService.isShortcutKeyEnabled = false;
        this.getDatabaseData();
    }

    ngOnDestroy(): void {
        this.destroyed.unsubscribe();
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    onImagePreview(position: number): void {
        this.metasFiltered.length === 2
            ? position === this.indexOfInterest
                ? this.loadImageOfInterest(position)
                : this.onPreviewTwoDrawings()
            : position < 1
            ? this.onPrevious()
            : position > 1
            ? this.onNext()
            : this.loadImageOfInterest(position);
    }

    previewFilteredImages(): void {
        for (let i = 0; i < this.metasFiltered.length; i++) {
            if (i >= MAX_NUMBER_IMAGES) {
                break;
            } else if (i === 1) {
                this.indexOfInterest = i;
            }
            this.imageIndexes.push(i);
        }
        this.hasDrawings = true;
    }

    loadImageOfInterest(position: number): void {
        if (this.path !== '/home' && !this.drawingService.isCanvasBlank(this.drawingService.baseCtx)) {
            const loadImageConfirmation = this.dialog.open(LoadConfirmationDialogComponent);
            this.drawingService.isCanvasBlank(this.drawingService.baseCtx);
            loadImageConfirmation
                .afterClosed()
                .pipe(takeUntil(this.destroyed))
                .subscribe((answer: string) => {
                    if (answer === 'confirm') {
                        this.applyImageOfInterest(this.imageIndexes[position]);
                        this.dialog.closeAll();
                    }
                });
        } else {
            this.applyImageOfInterest(this.imageIndexes[position]);
            this.dialog.closeAll();
        }
    }

    loadTagArray(object: MetaData): boolean {
        return Array.isArray(object.tags);
    }

    onPreviewTwoDrawings(): void {
        this.indexOfInterest === 1 ? (this.indexOfInterest = 0) : (this.indexOfInterest = 1);
    }

    onPrevious(): void {
        this.carrouselService.onPrevious(this.imageIndexes, this.metasFiltered);
    }

    onNext(): void {
        this.carrouselService.onNext(this.imageIndexes, this.metasFiltered);
    }

    deleteImage(): void {
        this.hasDrawings = false;
        let imageFilename: string;

        this.metasDatabase.length > 1
            ? (imageFilename = this.metasDatabase[this.imageIndexes[this.indexOfInterest]].filename)
            : (imageFilename = this.metasDatabase[this.imageIndexes[0]].filename);

        this.indexService
            .deleteDrawing(imageFilename)
            .pipe(takeUntil(this.destroyed))
            .subscribe(
                () => {
                    this.getDatabaseData();
                },
                () => {
                    this.snack.open("Une erreur est survenue lors de la suppression de l'image", '', { duration: 2000, panelClass: ['warning'] });
                    this.hasDrawings = true;
                },
            );
    }

    getDrawingsByTags(tags: string[]): void {
        this.metasFiltered = [];
        this.metasFiltered = this.metasDatabase.filter((drawing: MetaData) => {
            let exist = true;
            for (const tag of tags) {
                exist = drawing.tags.includes(tag);
                if (exist) {
                    break;
                }
            }
            return exist;
        });
        this.imageIndexes = [];
        this.previewFilteredImages();
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && this.metasDatabase.length === 2) {
            this.onPreviewTwoDrawings();
            return;
        }
        if (event.key === 'ArrowRight') {
            this.onNext();
        } else if (event.key === 'ArrowLeft') {
            this.onPrevious();
        }
    }

    closeCarrousel(): void {
        this.dialogRef.close();
    }
}
