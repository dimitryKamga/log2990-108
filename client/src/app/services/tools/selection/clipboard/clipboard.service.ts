import { Injectable } from '@angular/core';
import { SelectionBox } from '@app/classes/interfaces/select-interface';
import { LassoUndoAttributes } from '@app/classes/interfaces/tools-attributes';
import { Tool } from '@app/classes/tool';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService extends Tool {
    canCopy: boolean;
    canPaste: boolean;
    canCut: boolean;
    canDelete: boolean;

    movePaste: boolean;
    isCut: boolean;

    previousSelectionBox: SelectionBox;
    previousLassoBox: LassoUndoAttributes;

    constructor(drawingService: DrawingService, colorService: ColorService) {
        super(drawingService, colorService);
        this.initializeClipboardAttributes();
    }

    initializeClipboardAttributes(): void {
        this.canCopy = false;
        this.canPaste = false;
        this.canCut = false;
        this.canDelete = false;
        this.movePaste = false;
        this.isCut = false;
    }

    // Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
    // tslint:disable: no-empty | raison:  Pour des fonctions a instructions vides (subscribe)

    copy(): void {}
    paste(): void {}
    cut(): void {}
    delete(): void {}
    resetClipboard(): void {}
}
