import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { REGEX_TITLE } from '@app/classes/constants/regex-expressions';
import { ExportFilters, ExportFormats, ExportModes } from '@app/classes/enums/export-enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { ImgurData } from '@common/communication/imgurdata';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    canvas: HTMLCanvasElement;
    urlImage: HTMLImageElement;
    link: HTMLAnchorElement;
    imgurResponse: string;
    ext: string;

    currentFormat: BehaviorSubject<ExportFormats>;
    currentFilter: BehaviorSubject<ExportFilters>;
    currentExportMode: BehaviorSubject<ExportModes>;
    isTitleValid: BehaviorSubject<boolean>;

    private filtersMap: Map<ExportFilters, string>;

    constructor(private drawingService: DrawingService, private indexService: IndexService, private snack: MatSnackBar) {
        this.initialize();
    }

    private initialize(): void {
        this.currentFilter = new BehaviorSubject<ExportFilters>(ExportFilters.AUCUN);
        this.currentFormat = new BehaviorSubject<ExportFormats>(ExportFormats.JPEG);
        this.currentExportMode = new BehaviorSubject<ExportModes>(ExportModes.EXPORTER);
        this.isTitleValid = new BehaviorSubject<boolean>(false);
        this.canvas = document.createElement('canvas');
        this.link = document.createElement('a');
        this.urlImage = new Image();
        this.imgurResponse = 'null';

        this.filtersMap = new Map();
        this.filtersMap.set(ExportFilters.AUCUN, 'none');
        this.filtersMap.set(ExportFilters.CONTRASTE, 'contrast(0.3)');
        this.filtersMap.set(ExportFilters.ROTATION, 'hue-rotate(90deg)');
        this.filtersMap.set(ExportFilters.INVERSION, 'invert(100)');
        this.filtersMap.set(ExportFilters.SEPIA, 'sepia(100)');
        this.filtersMap.set(ExportFilters.GRAYSCALE, 'grayscale(100)');
    }

    private copyLink(): void {
        navigator.clipboard
            .writeText(this.imgurResponse)
            .then()
            .catch(() => console.error());
    }

    private checkCorrectFormat(): void {
        if (this.currentFormat.getValue() === ExportFormats.JPEG) {
            this.urlImage.src = this.canvas.toDataURL('image/jpeg');
            this.ext = 'image/jpeg';
        }
        if (this.currentFormat.getValue() === ExportFormats.PNG) {
            this.urlImage.src = this.canvas.toDataURL('image/png');
            this.ext = 'image/png';
        }
    }

    resetSubscribers(): void {
        this.currentFormat.next(ExportFormats.JPEG);
        this.currentExportMode.next(ExportModes.EXPORTER);
        this.currentFilter.next(ExportFilters.AUCUN);
        this.isTitleValid.next(false);
    }

    checkTitle(title: string): void {
        this.isTitleValid.next(REGEX_TITLE.test(title));
    }

    applyFilter(): void {
        this.drawingService.baseCtx.save();
        this.drawingService.baseCtx.globalCompositeOperation = 'destination-over';
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawingService.baseCtx.fillRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.drawingService.baseCtx.restore();
        const canvasVignete = document.createElement('canvas') as HTMLCanvasElement;
        const canvasVigneteCtx = canvasVignete.getContext('2d') as CanvasRenderingContext2D;
        canvasVignete.height = this.drawingService.canvas.height;
        canvasVignete.width = this.drawingService.canvas.width;
        const tempFilter = this.filtersMap.get(this.currentFilter.getValue());
        if (tempFilter !== undefined) {
            canvasVigneteCtx.filter = tempFilter;
        }
        canvasVigneteCtx.drawImage(this.drawingService.canvas, 0, 0);
        this.canvas = canvasVignete;
        this.urlImage.src = canvasVigneteCtx.canvas.toDataURL();
    }

    export(imgName: string): void {
        this.checkCorrectFormat();
        const finalString = imgName + '.' + this.currentFormat.getValue().toString();
        this.link.setAttribute('href', this.urlImage.src);
        this.link.setAttribute('download', finalString);
        this.link.click();
        this.resetSubscribers();
    }

    upload(imgName: string): void {
        this.checkCorrectFormat();
        this.link.setAttribute('href', this.urlImage.src);
        const base64 = this.urlImage.src.split(',')[1];
        const imgurData: ImgurData = { name: imgName, image: base64, ext: this.ext };
        this.indexService.uploadDrawing(imgurData).subscribe(
            (response) => {
                this.imgurResponse = JSON.parse(response).data.link;
                this.snack
                    .open('Image correctement téléversée ! Cliquer sur le lien pour copier : ', '' + this.imgurResponse + '', {
                        duration: 7000,
                        panelClass: ['save'],
                    })
                    .onAction()
                    .subscribe(() => this.copyLink());
            },
            () => {
                this.snack.open("Image n'a pas pu être téléversé ", '', { duration: 3000, panelClass: ['warning'] });
            },
        );
        this.resetSubscribers();
    }
}
