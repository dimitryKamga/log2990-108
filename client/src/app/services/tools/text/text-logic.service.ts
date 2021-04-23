import { Injectable } from '@angular/core';
import { DEFAULT_FONT_STYLE, DEFAULT_STYLE, DEFAULT_TEXT_SIZE, MARGIN, MOVE_LEFT } from '@app/classes/constants/draw-constants';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { KeyValues, MouseButton } from '@app/classes/enums/draw-enums';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorService } from '@app/services/color/color.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { TextService } from '@app/services/tools/text/text.service';
import { UndoRedoPilesService } from '@app/services/undo-redo/undo-redo-piles.service';

@Injectable({
    providedIn: 'root',
})
export class TextLogicService extends Tool {
    // nécessaire pour la reconnaissance de l'outil par l'undo-redo
    name: string = TOOL_LABELS.TEXT;

    constructor(
        drawingService: DrawingService,
        colorService: ColorService,
        private shortcutsHandlerService: ShortcutsHandlerService,
        private undoRedoPiles: UndoRedoPilesService,
        private textService: TextService,
    ) {
        super(drawingService, colorService);
        this.initialize();
    }

    private initialize(): void {
        this.textService.line = '|';
        this.textService.isNewWriting = false;
        this.textService.font = DEFAULT_FONT_STYLE;
        this.textService.textSize = DEFAULT_TEXT_SIZE;
        this.textService.textAlign = 'start';
        this.textService.boldStyle = DEFAULT_STYLE;
        this.textService.italicStyle = DEFAULT_STYLE;
        this.textService.frontPosition = false;
        this.textService.canWrite = true;
    }

    private startText(): void {
        this.shortcutsHandlerService.isShortcutKeyEnabled = false;
        this.textService.text = [];
        this.textService.isNewWriting = true;
        this.textService.text.push(this.textService.line);
        this.setFontStyle();
    }

    private isCursorOnText(mousePosition: Vec2): boolean {
        if (!this.textService.text) return false;
        const widthSelect = this.textService.initialPoint.x + this.drawingService.previewCtx.measureText(this.textService.lastRow).width;
        const heightSelect = this.textService.height * this.textService.text.join('').split('Enter').length + this.textService.initialPoint.y;
        return (
            mousePosition.x >= this.textService.initialPoint.x &&
            mousePosition.x <= widthSelect &&
            mousePosition.y >= this.textService.initialPoint.y &&
            mousePosition.y <= heightSelect
        );
    }
    private confirmText(): void {
        if (!this.textService.text) return;
        this.removeCursorPointer();
        this.generateText();
        this.drawingService.handlePreviewCanvas();
        this.textService.baseData = this.drawingService.getCanvasBaseData();
        this.textService.restoreTextAttributes();
        this.undoRedoPiles.handlePiles(this.textService.textAttributes);
        this.undoRedoPiles.setSelectedTool(false);
        this.drawingService.autoSave();
        this.reset();
    }

    private moveCursorUpDown(cursorMove: string): void {
        const rows = this.textService.text.join('').split('Enter');
        const linePosition: Vec2 = this.textService.getLinePosition(rows);

        if (cursorMove === 'UP' && !this.isFirstRow()) {
            this.textService.moveCursorUp(linePosition, rows);
        } else if (cursorMove === 'DOWN' && !this.isLastRow()) {
            this.textService.moveCursorDown(linePosition, rows);
        }
        this.removeCursorPointer();
        this.addObjecttoText(this.textService.line);
    }

    private isFirstRow(): boolean {
        return this.textService.text.indexOf(KeyValues.ENTER) > this.textService.indexPosition || this.textService.text.indexOf(KeyValues.ENTER) < 0;
    }

    private isLastRow(): boolean {
        return (
            this.textService.text.lastIndexOf(KeyValues.ENTER) < this.textService.indexPosition ||
            this.textService.text.lastIndexOf(KeyValues.ENTER) < 0
        );
    }

    private addObjecttoText(character: string): void {
        if (character === this.textService.line && this.textService.indexPosition >= this.textService.text.length) {
            this.textService.text.push(this.textService.line);
        } else if (this.textService.indexPosition >= this.textService.text.length) {
            this.textService.text.pop();
            this.textService.text.push(character);
            this.textService.text.push(this.textService.line);
        } else {
            this.addCharacter(character);
        }
    }

    private addCharacter(character: string): void {
        const tempText = [];
        let i = 0;
        for (const char of this.textService.text) {
            if (i === this.textService.indexPosition) {
                tempText.push(character);
            }
            tempText.push(char);
            i++;
        }
        this.textService.text = tempText;
    }

    private removeText(position: number): void {
        if (position < 0 && this.textService.frontPosition) return;
        if (position >= this.textService.text.length && !this.textService.frontPosition) {
            return;
        }
        const beforePosition = this.textService.text.slice(0, position);
        const afterPosition = this.textService.text.slice(position + 1);
        this.textService.text = beforePosition.concat(afterPosition);
    }

    private removeCursorPointer(): void {
        const tempText = [];
        for (const char of this.textService.text) {
            if (char !== this.textService.line) {
                tempText.push(char);
            }
        }
        this.textService.text = tempText;
    }

    private addCursorToRow(row: string[], column: number, rowWidth: number): void {
        if (row.indexOf(this.textService.line) >= 0) {
            this.printCursorPosition(row, column);
        } else {
            this.drawingService.previewCtx.fillText(row.join(''), rowWidth, column);
        }
        if (row.length > this.textService.lastRow.length) this.textService.lastRow = row.join('');
    }

    private printNewRow(row: string[], column: number, rowWidth: number): void {
        if (row.indexOf(this.textService.line) >= 0) {
            this.printCursorPosition(row, column);
        } else {
            this.drawingService.previewCtx.fillText(row.join(''), rowWidth, column);
        }
    }

    private setFirstPoint(line: string[]): number {
        let rowWidth = this.textService.initialPoint.x;
        if (this.textService.textAlign === 'center') {
            rowWidth -= this.drawingService.previewCtx.measureText(line.join('')).width / 2;
        } else if (this.textService.textAlign === 'end') {
            rowWidth -= this.drawingService.previewCtx.measureText(line.join('')).width;
        }
        return rowWidth;
    }

    private printCursorPosition(row: string[], lineHeight: number): void {
        const afterLine: string[] = row.slice(row.indexOf(this.textService.line) + 1);
        const beforeLine = row.slice(0, row.indexOf(this.textService.line));
        let rowWidth = this.setFirstPoint(row);
        this.drawingService.previewCtx.textAlign = 'start';
        this.drawingService.previewCtx.fillText(beforeLine.join(''), rowWidth, lineHeight);
        rowWidth += this.drawingService.previewCtx.measureText(beforeLine.join('')).width;
        this.printCursor(rowWidth, lineHeight);
        rowWidth += this.drawingService.previewCtx.measureText(this.textService.line).width;
        this.drawingService.previewCtx.fillText(afterLine.join(''), rowWidth, lineHeight);
        this.drawingService.previewCtx.textAlign = this.textService.textAlign;
    }

    private printCursor(rowWidth: number, column: number): void {
        const fill = this.drawingService.previewCtx.fillStyle;
        this.drawingService.previewCtx.fillStyle = '#000000';
        this.drawingService.previewCtx.fillText(this.textService.line, rowWidth, column);
        this.drawingService.previewCtx.fillStyle = fill;
    }

    private moveCursorLeftRight(distance: number): void {
        if (distance < 0 && this.textService.indexPosition <= 0) return;
        else if (distance > 0 && this.textService.indexPosition + 1 >= this.textService.text.length) return;
        this.removeCursorPointer();
        this.textService.indexPosition = this.textService.indexPosition + distance;
        this.addObjecttoText(this.textService.line);
    }
    setItalic(isItalic: boolean): void {
        if (isItalic) {
            this.textService.italicStyle = 'italic';
        } else {
            this.textService.italicStyle = 'normal';
        }
        this.setFontStyle();
    }

    setBold(isBold: boolean): void {
        if (isBold) {
            this.textService.boldStyle = 'bold';
        } else {
            this.textService.boldStyle = 'normal';
        }
        this.setFontStyle();
    }

    setAlignment(alignment: string): void {
        this.textService.textAlign = alignment as CanvasTextAlign;
        this.setFontStyle();
    }

    setSize(size: number): void {
        this.textService.textSize = size;
        this.setFontStyle();
    }

    reset(): void {
        this.textService.text = [];
        this.textService.isNewWriting = false;
        this.textService.indexPosition = 0;
        this.shortcutsHandlerService.isShortcutKeyEnabled = true;
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isCursorOnText(this.getPositionFromMouse(event)) || event.button === MouseButton.RIGHT) {
            return;
        }
        if (this.textService.isNewWriting) {
            this.undoRedoPiles.setSelectedTool(true);
            this.confirmText();
        } else {
            const mouseCoords = this.getPositionFromMouse(event);
            this.textService.initialPoint = { x: mouseCoords.x, y: mouseCoords.y };
            this.startText();
        }
    }

    onMouseEnter(): void {
        this.setFontStyle();
    }
    onKeyDown(event: KeyboardEvent): void {
        if (!this.textService.isNewWriting || !this.textService.canWrite) return;
        switch (event.key) {
            case KeyValues.BACKSPACE:
                this.textService.indexPosition > 0 ? (this.textService.frontPosition = false) : (this.textService.frontPosition = true);
                this.removeText(this.textService.indexPosition - 1);
                this.textService.indexPosition--;
                break;
            case KeyValues.DELETE:
                this.textService.frontPosition = true;
                this.removeText(this.textService.indexPosition + 1);
                break;
            case KeyValues.ARROW_LEFT:
                this.moveCursorLeftRight(MOVE_LEFT);
                break;
            case KeyValues.ARROW_RIGHT:
                this.moveCursorLeftRight(1);
                break;
            case KeyValues.ARROW_UP:
                this.moveCursorUpDown('UP');
                break;
            case KeyValues.ARROW_DOWN:
                this.moveCursorUpDown('DOWN');
                break;
            case KeyValues.ESCAPE:
                this.undoRedoPiles.setSelectedTool(true);
                this.confirmText();
                break;
            case KeyValues.ALT:
                event.preventDefault();
                break;
            default:
                if (this.textService.isKeyAuthorized(event.key)) {
                    this.addObjecttoText(event.key);
                    this.textService.indexPosition++;
                }
                break;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        this.generateText();
    }

    generateText(): void {
        this.textService.lastRow = '';
        if (!this.textService.text) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        let row: string[] = [];
        let column = this.textService.initialPoint.y + this.textService.height;
        const rowWidth = this.textService.initialPoint.x;
        for (const char of this.textService.text) {
            if (char === KeyValues.ENTER) {
                this.printNewRow(row, column, rowWidth);
                column += this.textService.height + MARGIN;
                if (row.length > this.textService.lastRow.length) this.textService.lastRow = row.join('');
                row = [];
            } else {
                row.push(char);
            }
        }
        this.addCursorToRow(row, column, rowWidth);
    }

    setFontStyle(): void {
        const fillText = 'wWmML';
        this.drawingService.previewCtx.fillStyle = this.colorService.primaryColor;
        this.drawingService.previewCtx.font =
            this.textService.italicStyle +
            ' ' +
            this.textService.boldStyle +
            ' ' +
            this.textService.textSize.toString() +
            'px ' +
            this.textService.font;
        this.drawingService.previewCtx.textAlign = this.textService.textAlign;
        const measurements = this.drawingService.previewCtx.measureText(fillText);
        this.textService.height = measurements.actualBoundingBoxAscent;
        this.generateText();
    }
}
