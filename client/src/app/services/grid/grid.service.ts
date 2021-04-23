import { Injectable } from '@angular/core';
import {
    GRID_DEFAULT_SQUARESIZE,
    GRID_MAX_OPACITY,
    GRID_MAX_SQUARESIZE,
    GRID_MIN_OPACITY,
    GRID_MIN_SQUARESIZE,
    GRID_SQUARESIZE_INCREMENT,
} from '@app/classes/constants/draw-constants';
import { ShortcutKeys } from '@app/classes/enums/draw-enums';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    isEnabled: boolean;
    opacity: number;
    squareSize: number;
    gridCtx: CanvasRenderingContext2D;
    gridCanvas: HTMLCanvasElement;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.squareSize = GRID_DEFAULT_SQUARESIZE;
        this.isEnabled = false;
        this.opacity = GRID_MIN_OPACITY;
    }

    private incrementShortcutSpacing(): void {
        if (this.squareSize < GRID_MAX_SQUARESIZE) {
            this.squareSize += GRID_SQUARESIZE_INCREMENT - (this.squareSize % GRID_SQUARESIZE_INCREMENT);
        }
        this.setGrid();
    }
    private decrementShortcutSpacing(): void {
        if (this.squareSize > GRID_MIN_SQUARESIZE) {
            this.squareSize -=
                this.squareSize % GRID_SQUARESIZE_INCREMENT === 0 ? GRID_SQUARESIZE_INCREMENT : this.squareSize % GRID_SQUARESIZE_INCREMENT;
        }
        this.setGrid();
    }

    private clearGridCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    }

    setGridEnabler(): void {
        this.isEnabled = !this.isEnabled;
        this.gridHandler();
    }

    keyboardHandler(keyCode: string): void {
        switch (keyCode) {
            case ShortcutKeys.PLUS: {
                this.incrementShortcutSpacing();
                break;
            }
            case ShortcutKeys.EQUAL: {
                this.incrementShortcutSpacing();

                break;
            }
            case ShortcutKeys.MINUS: {
                this.decrementShortcutSpacing();

                break;
            }
        }
    }

    changeSquareSize(squareSize: number): void {
        this.squareSize = squareSize;
        if (this.squareSize >= GRID_MIN_SQUARESIZE && this.squareSize <= GRID_MAX_SQUARESIZE) {
            this.setGrid();
        }
    }

    changeOpacity(opacity: number): void {
        this.opacity = opacity;
        if (this.opacity >= GRID_MIN_OPACITY && this.opacity <= GRID_MAX_OPACITY) {
            this.gridCtx.globalAlpha = this.opacity;
            this.setGrid();
        }
    }

    gridHandler(): void {
        if (this.isEnabled) {
            this.setGrid();
        } else {
            this.clearGridCanvas(this.gridCtx);
        }
    }

    setGrid(): void {
        this.clearGridCanvas(this.gridCtx);
        for (let c = 1; c < this.gridCanvas.width / this.squareSize; c++) {
            this.gridCtx.beginPath();
            this.gridCtx.globalAlpha = this.opacity / GRID_MAX_OPACITY;
            this.gridCtx.moveTo(c * this.squareSize, 0);
            this.gridCtx.lineTo(c * this.squareSize, this.gridCtx.canvas.height);
            this.gridCtx.stroke();
        }
        for (let r = 1; r < this.gridCanvas.height / this.squareSize; r++) {
            this.gridCtx.beginPath();
            this.gridCtx.globalAlpha = this.opacity / GRID_MAX_OPACITY;
            this.gridCtx.moveTo(0, r * this.squareSize);
            this.gridCtx.lineTo(this.gridCtx.canvas.width, r * this.squareSize);
            this.gridCtx.stroke();
        }
    }
}
