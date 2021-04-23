import { Injectable } from '@angular/core';
import { BucketService } from '@app/services/tools/bucket/bucket.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { EyedropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { SelectEllipseService } from '@app/services/tools/selection/select-ellipse/select-ellipse.service';
import { SelectLassoService } from '@app/services/tools/selection/select-lasso/select-lasso.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { EllipseService } from '@app/services/tools/shape/ellipse/ellipse.service';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/shape/rectangle/rectangle.service';
import { SprayService } from '@app/services/tools/spray/spray.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextLogicService } from '@app/services/tools/text/text-logic.service';

@Injectable({
    providedIn: 'root',
})
export class ResetToolsService {
    constructor(
        private textLogicService: TextLogicService,
        private pencilService: PencilService,
        private lineService: LineService,
        private rectangleService: RectangleService,
        private ellipseService: EllipseService,
        private selectRectangleService: SelectRectangleService,
        private selectEllipseService: SelectEllipseService,
        private polygonService: PolygonService,
        private eraserService: EraserService,
        private eyedropperService: EyedropperService,
        private sprayService: SprayService,
        private bucketService: BucketService,
        private stampService: StampService,
        private selectLassoService: SelectLassoService,
    ) {}

    initializeTools(): void {
        this.eraserService.initializeAttributes();
        this.eyedropperService.initializeAttributes();
        this.lineService.reset();
        this.pencilService.initializeAttributes();
        this.selectEllipseService.initializeAttributes();
        this.selectRectangleService.initializeAttributes();
        this.selectLassoService.initializeLassoUndo();
        this.selectLassoService.initializeAttributes();

        this.ellipseService.initializeEllipseAttributes();
        this.rectangleService.initializeRectangleAttributes();
        this.polygonService.initializePolygonAttributes();
        this.sprayService.initializeAttributes();
        this.textLogicService.reset();
        this.stampService.initializeAttributes();

        this.selectRectangleService.initializeClipboardAttributes();
        this.selectEllipseService.initializeClipboardAttributes();
        this.selectLassoService.initializeClipboardAttributes();

        this.selectRectangleService.resetClipboard();
        this.selectEllipseService.resetClipboard();
        this.selectLassoService.resetClipboard();

        this.bucketService.initializeAttributes();
    }
}
