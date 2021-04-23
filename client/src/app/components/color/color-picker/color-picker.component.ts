import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ColorType, MouseButton } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { EyedropperService } from '@app/services/tools/eye-dropper/eye-dropper.service';

export const DEFAULT_COLOR_HISTORY: string[] = [];
@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements AfterViewInit {
    @ViewChild('mainColor', { static: false }) protected mainColor: ElementRef;
    @ViewChild('secColor', { static: false }) protected secColor: ElementRef;

    readonly PRIMARY: ColorType = ColorType.PRIMARY;
    readonly SECONDARY: ColorType = ColorType.SECONDARY;
    primaryColor: string;
    secondaryColor: string;
    primaryOpacity: number;
    secondaryOpacity: number;
    actualPrimaryColor: string;
    actualSecondaryColor: string;

    // le hiistory ne s'affiche pas si le tableau est initialisé dans le constructeur
    colorHistory: string[] = DEFAULT_COLOR_HISTORY;

    constructor(private colorService: ColorService, private eyeDropper: EyedropperService) {
        this.initialize();
    }

    private initialize(): void {
        this.colorHistory = this.colorService.colors;
        this.primaryOpacity = this.colorService.primaryOpacity;
        this.secondaryOpacity = this.colorService.secondaryOpacity;
        this.actualPrimaryColor = this.colorService.primaryColor;
        this.actualSecondaryColor = this.colorService.secondaryColor;
        this.primaryColor = '#424263';
        this.secondaryColor = '#d49db2';
    }

    ngAfterViewInit(): void {
        this.eyeDropper.primaryColor.subscribe((color: string) => {
            this.primaryColor = color;
            this.colorService.primaryColor = color;
        });
        this.eyeDropper.secondaryColor.subscribe((color: string) => {
            this.secondaryColor = color;
            this.colorService.secondaryColor = color;
        });
        this.eyeDropper.primaryOpacity.subscribe((opacity: number) => {
            this.primaryOpacity = opacity;
            this.colorService.setOpacity(this.primaryOpacity, ColorType.PRIMARY);
            this.mainColor.nativeElement.style.opacity = this.primaryOpacity.toString();
        });
        this.eyeDropper.secondaryOpacity.subscribe((opacity: number) => {
            this.secondaryOpacity = opacity;
            this.colorService.setOpacity(this.secondaryOpacity, ColorType.SECONDARY);
            this.secColor.nativeElement.style.opacity = this.secondaryOpacity.toString();
        });
    }

    selectColor(currentColor: string, type: ColorType): void {
        if (type === ColorType.PRIMARY) {
            this.primaryColor = currentColor;
            this.colorService.setPrimaryColor(currentColor, this.primaryOpacity);
            this.actualPrimaryColor = this.primaryColor;
        }
        if (type === ColorType.SECONDARY) {
            this.secondaryColor = currentColor;
            this.colorService.setSecondaryColor(currentColor, this.secondaryOpacity);
            this.actualSecondaryColor = this.secondaryColor;
        }
    }

    invertColors(): void {
        const temp: string = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = temp;
        this.colorService.primaryColor = this.primaryColor;
        this.colorService.secondaryColor = this.secondaryColor;
        this.actualPrimaryColor = this.primaryColor;
        this.actualSecondaryColor = this.secondaryColor;
        this.colorService.setOpacity(this.primaryOpacity, ColorType.PRIMARY);
        this.colorService.setOpacity(this.secondaryOpacity, ColorType.SECONDARY);
    }

    chooseColorFromHistory(event: MouseEvent, color: string): void {
        if (event.button === MouseButton.LEFT) {
            this.primaryColor = color;
            this.colorService.primaryColor = color;
            this.colorService.setOpacity(this.primaryOpacity, ColorType.PRIMARY);
        }
        if (event.button === MouseButton.RIGHT) {
            this.secondaryColor = color;
            this.colorService.secondaryColor = color;
            this.colorService.setOpacity(this.secondaryOpacity, ColorType.SECONDARY);
        }
        event.preventDefault();
    }

    setOpacity(event: MatSliderChange, type: ColorType): void {
        if (event.value !== null) {
            if (type === ColorType.PRIMARY) {
                this.mainColor.nativeElement.style.opacity = event.value.toString();
                this.colorService.primaryColor = this.colorService.hexToRGBA(this.primaryColor, event.value);
            }
            if (type === ColorType.SECONDARY) {
                this.secColor.nativeElement.style.opacity = event.value.toString();
                const newColor: string = this.colorService.hexToRGBA(this.secondaryColor, event.value);
                this.colorService.secondaryColor = newColor;
            }
        }
    }
}
