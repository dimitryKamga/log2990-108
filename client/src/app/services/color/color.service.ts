import { Injectable } from '@angular/core';
import { RGBA_INDEXER } from '@app/classes/constants/color-constant';
import {
    BLUE_START_INDEX,
    DEFAULT_OPACITY,
    GREEN_END_INDEX,
    GREEN_START_INDEX,
    HEX_BASE,
    MAXIMUM_RGBA_VALUE,
    PASTEL_BLUE,
    PASTEL_GREEN,
    PASTEL_OLIVE,
    PASTEL_ORANGE,
    PASTEL_PINK,
    PASTEL_PURPLE,
    PASTEL_RED,
    PASTEL_ROYAL,
    PASTEL_VIOLET,
    PASTEL_YELLOW,
    PREVIEWS_COLOR_NUMBER,
    RED_END_INDEX,
    RED_START_INDEX,
} from '@app/classes/constants/draw-constants';
import { ColorType } from '@app/classes/enums/draw-enums';
import { Rgba } from '@app/classes/interfaces/color-interface';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    primaryColor: string;
    secondaryColor: string;
    primaryOpacity: number;
    secondaryOpacity: number;
    colors: string[];

    constructor() {
        this.initialize();
    }

    initialize(): void {
        this.primaryColor = this.hexToRGBA('#424263', 1);
        this.secondaryColor = this.hexToRGBA('#d49db2', 1);
        this.primaryOpacity = DEFAULT_OPACITY;
        this.secondaryOpacity = DEFAULT_OPACITY;
        this.colors = [];

        this.colors = [
            PASTEL_PINK,
            PASTEL_PURPLE,
            PASTEL_YELLOW,
            PASTEL_RED,
            PASTEL_ORANGE,
            PASTEL_GREEN,
            PASTEL_BLUE,
            PASTEL_VIOLET,
            PASTEL_OLIVE,
            PASTEL_ROYAL,
        ];
    }

    setPrimaryColor(color: string, alpha: number): void {
        this.primaryColor = color;
        this.addColorToHistory(this.primaryColor);
        this.primaryColor = this.hexToRGBA(color, alpha);
    }

    setSecondaryColor(color: string, alpha: number): void {
        this.secondaryColor = color;
        this.addColorToHistory(this.secondaryColor);
        this.secondaryColor = this.hexToRGBA(color, alpha);
    }

    addColorToHistory(newColor: string): void {
        if (this.colors.length === PREVIEWS_COLOR_NUMBER) {
            this.colors.pop();
        }
        this.colors.unshift(newColor);
    }

    setOpacity(opacity: number, type: ColorType): void {
        if (type === ColorType.PRIMARY) {
            this.primaryOpacity = opacity;
            this.primaryColor = this.hexToRGBA(this.primaryColor, opacity);
        }
        if (type === ColorType.SECONDARY) {
            this.secondaryOpacity = opacity;
            this.secondaryColor = this.hexToRGBA(this.secondaryColor, this.secondaryOpacity);
        }
    }

    hexToRGBA(color: string, opacity: number): string {
        const r: number = parseInt(color.slice(RED_START_INDEX, RED_END_INDEX).padStart(1, '0'), HEX_BASE);
        const g: number = parseInt(color.slice(GREEN_START_INDEX, GREEN_END_INDEX).padStart(1, '0'), HEX_BASE);
        const b: number = parseInt(color.slice(BLUE_START_INDEX).padStart(1, '0'), HEX_BASE);
        const rgba: string = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity.toString() + ')';
        return rgba;
    }

    getRgba(stringColor: string): Rgba {
        const slicingIndex = stringColor.indexOf('(') + 1;
        const rgbaColor: string = stringColor.slice(slicingIndex);

        const subStrings = rgbaColor.split(',');
        const rgba: Rgba = {
            RED: parseInt(subStrings[RGBA_INDEXER.RED], 10),
            GREEN: parseInt(subStrings[RGBA_INDEXER.GREEN], 10),
            BLUE: parseInt(subStrings[RGBA_INDEXER.BLUE], 10),
            ALPHA: parseFloat(subStrings[RGBA_INDEXER.ALPHA]) * MAXIMUM_RGBA_VALUE,
        };

        return rgba;
    }
}
