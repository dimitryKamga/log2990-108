import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { REGEX_TITLE } from '@app/classes/constants/regex-expressions';
import { ExportFormats } from '@app/classes/enums/export-enums';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { MetaData } from '@common/communication/metadata';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SavingService {
    isTitleValid: BehaviorSubject<boolean>;
    currentFormat: BehaviorSubject<ExportFormats>;
    extension: string;

    constructor(private indexService: IndexService, private drawingService: DrawingService, private snack: MatSnackBar) {
        this.initialize();
    }

    private initialize(): void {
        this.isTitleValid = new BehaviorSubject<boolean>(false);
        this.currentFormat = new BehaviorSubject<ExportFormats>(ExportFormats.PNG);
    }

    private checkCorrectFormat(): void {
        if (this.currentFormat.getValue() === ExportFormats.JPEG) {
            this.extension = 'image/jpeg';
        }
        if (this.currentFormat.getValue() === ExportFormats.PNG) {
            this.extension = 'image/png';
        }
    }

    checkTitle(name: string): void {
        this.isTitleValid.next(REGEX_TITLE.test(name));
    }

    resetSubscribers(): void {
        this.currentFormat.next(ExportFormats.PNG);
        this.isTitleValid.next(false);
    }

    async sendDrawing(name: string, tagsSet: Set<string>): Promise<void> {
        let tags: string[];
        tags = [];
        tagsSet.forEach((elt) => {
            tags.push(elt);
        });
        const canvasVignete = document.createElement('canvas') as HTMLCanvasElement;
        const canvasVigneteCtx = canvasVignete.getContext('2d') as CanvasRenderingContext2D;
        canvasVignete.height = this.drawingService.canvas.height;
        canvasVignete.width = this.drawingService.canvas.width;
        canvasVigneteCtx.drawImage(this.drawingService.canvas, 0, 0);
        const canvas = canvasVigneteCtx.canvas.toDataURL();
        const blob = await (await fetch(canvas)).blob();
        this.checkCorrectFormat();
        const meta: MetaData = { name, tags, filename: 'null', ext: this.extension };
        const formData = new FormData();
        formData.append('name', meta.name);
        meta.tags.forEach((tag: string) => {
            formData.append('tags', tag);
        });
        formData.append('ext', meta.ext);
        formData.append('image', blob);
        this.indexService.postDrawing(formData).subscribe(
            () => {
                this.snack.open('Image correctement sauvegardé', '', { duration: 3000, panelClass: ['save'] });
            },
            () => {
                this.snack.open("Image n'a pas pu être sauvegardé ", '', { duration: 3000, panelClass: ['warning'] });
            },
        );
        this.resetSubscribers();
    }
}
