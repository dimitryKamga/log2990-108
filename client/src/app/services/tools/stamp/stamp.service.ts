import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ANGLE_1, ANGLE_180, DEFAULT_ANGLE, DEFAULT_SIZE, FACTOR_5, MAX_ANGLE, ROTATION_STEP_ANGLE } from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { MouseButton, StampChoiceLabels, StampIconsPath } from '@app/classes/enums/draw-enums';
import { StampAttributes } from '@app/classes/interfaces/tools-attributes';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.STAMP;

    stampAttributes: StampAttributes;
    stampMap: Map<StampChoiceLabels, HTMLImageElement>;
    mouseMove: MouseEvent;
    stampForm: FormGroup;
    private isAlt: boolean;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        private undoRedoPiles: UndoRedoPilesService,
        private shortcutsHandlerService: ShortcutsHandlerService,
    ) {
        super(drawingService, colorService);
        this.initializeAttributes();
    }

    private loadStampIcons(): void {
        const choices = Object.values(StampChoiceLabels);
        const path = Object.values(StampIconsPath);
        for (let i = 0; i < path.length; ++i) {
            const image = new Image();
            image.src = path[i];
            image.height = this.stampAttributes.size;
            image.width = this.stampAttributes.size;
            this.stampMap.set(choices[i] as StampChoiceLabels, image);
        }
    }

    initializeAttributes(): void {
        this.stampAttributes = {
            name: this.name,
            mainColor: this.colorService.primaryColor,
            secondaryColor: this.colorService.secondaryColor,
            thickness: 1,
            size: DEFAULT_SIZE,
            pathData: { x: 0, y: 0 },
            angle: new BehaviorSubject(DEFAULT_ANGLE),
            stampChoice: StampChoiceLabels.FIRST_CHOICE,
        };
        this.isAlt = false;
        this.stampForm = new FormGroup({});
        this.stampMap = new Map();
        this.loadStampIcons();
    }

    setSize(size: number): void {
        this.stampAttributes.size = size;
    }

    getSize(): number {
        return this.stampAttributes.size * FACTOR_5;
    }

    setStampChoice(choice: StampChoiceLabels): void {
        if (Object.values(StampChoiceLabels).includes(choice)) {
            this.stampAttributes.stampChoice = choice;
        }
    }

    getStampChoice(): StampChoiceLabels {
        return this.stampAttributes.stampChoice;
    }

    setAngle(angle: number): void {
        angle = (angle + MAX_ANGLE) % MAX_ANGLE;
        this.stampAttributes.angle.next(angle);
    }

    getAngle(): Observable<number> {
        return this.stampAttributes.angle;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.LEFT;
        if (this.mouseDown) {
            this.shortcutsHandlerService.isShortcutKeyEnabled = false;
            this.stampAttributes.pathData = this.getPositionFromMouse(event);
            this.drawStampIcon(this.drawingService.baseCtx, this.stampAttributes);
            this.undoRedoPiles.handlePiles(this.stampAttributes);
            this.undoRedoPiles.setSelectedTool(false);
            this.drawingService.autoSave();
        }
    }
    onMouseUp(event: MouseEvent): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    onMouseMove(event: MouseEvent): void {
        this.mouseMove = event;
        this.stampAttributes.pathData = this.getPositionFromMouse(event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawStampIcon(this.drawingService.previewCtx, this.stampAttributes);
    }

    onMouseWheel(event: WheelEvent): void {
        const chooseAngle = this.isAlt ? ANGLE_1 : ROTATION_STEP_ANGLE;
        let angle = this.stampAttributes.angle.getValue() - (event.deltaY / Math.abs(event.deltaY)) * chooseAngle;
        angle = (angle + MAX_ANGLE) % MAX_ANGLE;

        this.stampForm.patchValue({
            angleFormField: angle,
        });
        this.setAngle(angle);

        this.onMouseMove(this.mouseMove);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.altKey) {
            this.isAlt = true;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.altKey) {
            this.isAlt = false;
        }
    }

    onMouseLeave(): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
        this.mouseDown = false;
    }

    drawStampIcon(ctx: CanvasRenderingContext2D, stamp: StampAttributes): void {
        const icon = this.stampMap.get(stamp.stampChoice) as HTMLImageElement;
        ctx.save();

        ctx.translate(stamp.pathData.x, stamp.pathData.y);
        ctx.scale(stamp.size * FACTOR_5, stamp.size * FACTOR_5);
        ctx.rotate((stamp.angle.getValue() * Math.PI) / ANGLE_180);
        ctx.drawImage(icon, -stamp.size, -stamp.size, stamp.size, stamp.size);
        ctx.restore();
    }
}
