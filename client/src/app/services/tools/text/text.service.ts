import { Injectable } from '@angular/core';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { TextAttributes } from '@app/classes/interfaces/tools-attributes';
import { PERMITTED_KEYS } from '@app/classes/text';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class TextService {
    textAttributes: TextAttributes;
    baseData: ImageData;
    text: string[];
    lineIndicator: number;
    initialPoint: Vec2;
    isNewWriting: boolean;
    font: string;
    textSize: number;
    italicStyle: string;
    boldStyle: string;
    textAlign: CanvasTextAlign;
    height: number;
    frontPosition: boolean;
    lastRow: string;
    canWrite: boolean;
    textData: Text;
    indexPosition: number;
    line: string;
    constructor(private drawingService: DrawingService, private colorService: ColorService) {
        this.initialize();
    }

    private initialize(): void {
        this.lineIndicator = 0;
        this.initialPoint = { x: 0, y: 0 };
    }

    getLinePosition(lines: string[]): Vec2 {
        let i = 0;
        for (const line of lines) {
            const lineIndex = line.indexOf('|');
            if (lineIndex >= 0) {
                return { x: lineIndex, y: i };
            }
            i++;
        }
        return { x: -1, y: -1 };
    }

    moveCursorUp(linePosition: Vec2, rows: string[]): void {
        if (rows[linePosition.y - 1].length < linePosition.x) {
            this.indexPosition -= linePosition.x + 1;
        } else {
            this.indexPosition -= linePosition.x + 1;
            this.indexPosition -= rows[linePosition.y - 1].length - linePosition.x;
        }
    }

    moveCursorDown(linePosition: Vec2, rows: string[]): void {
        if (rows[linePosition.y + 1].length < linePosition.x) {
            this.indexPosition += rows[linePosition.y].length - linePosition.x;
            this.indexPosition += rows[linePosition.y + 1].length;
        } else {
            this.indexPosition += rows[linePosition.y].length - linePosition.x;
            this.indexPosition += linePosition.x;
        }
    }

    isKeyAuthorized(keyCode: string): boolean {
        return (keyCode >= 'a' && keyCode <= 'z') || (keyCode >= '0' && keyCode <= '9') || PERMITTED_KEYS.includes(keyCode);
    }

    updateText(textAttributes: TextAttributes): void {
        this.drawingService.baseCtx.putImageData(textAttributes.imageData, 0, 0);
    }

    restoreTextAttributes(): void {
        this.textAttributes = {
            name: TOOL_LABELS.TEXT,
            imageData: this.baseData,
            mainColor: this.colorService.primaryColor,
            secondaryColor: '',
            thickness: 1,
        };
    }
}
