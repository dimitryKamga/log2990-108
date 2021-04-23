import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderChange, MatSliderModule } from '@angular/material/slider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ColorType, MouseButton } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { ColorPickerComponent } from './color-picker.component';
import SpyObj = jasmine.SpyObj;

// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-magic-numbers | raison : Pour couvrir tous les cas de figure

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    let colorServiceSpy: SpyObj<ColorService>;
    const mainColor = 'black';
    const secondaryColor = 'white';
    const leftClick = new MouseEvent('onclick', { button: MouseButton.LEFT });
    const middleClick = new MouseEvent('onclick', { button: MouseButton.MIDDLE });
    const rightClick = new MouseEvent('onclick', { button: MouseButton.RIGHT });
    beforeEach(async(() => {
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['setPrimaryColor', 'setSecondaryColor', 'setOpacity', 'hexToRGBA']);
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent],
            imports: [NoopAnimationsModule, FormsModule, MatCardModule, MatRadioModule, MatSliderModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: ColorService, useValue: colorServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['eyeDropper'].primaryColor.emit('#ffffff');
        component['eyeDropper'].secondaryColor.emit('#ffffff');
        component['eyeDropper'].primaryOpacity.emit(1);
        component['eyeDropper'].secondaryOpacity.emit(1);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call select primary color after the dialog is closed', () => {
        component.selectColor(mainColor, ColorType.PRIMARY);
        expect(colorServiceSpy.setPrimaryColor).toHaveBeenCalled();
    });
    it('should call select secondary color after the dialog is closed', () => {
        component.selectColor(secondaryColor, ColorType.SECONDARY);
        expect(colorServiceSpy.setSecondaryColor).toHaveBeenCalled();
    });

    it('should set primary color opacity when different to null', () => {
        const event = { value: 0.5 } as MatSliderChange;
        component.setOpacity(event, ColorType.PRIMARY);
        expect(event.value).toEqual(0.5);
    });

    it('should set secondary color opacity when different to null', () => {
        const event = { value: 1 } as MatSliderChange;
        component.setOpacity(event, ColorType.SECONDARY);
        expect(event.value).not.toEqual(null);
    });

    it('should not set opacity when equal null', () => {
        const event = { value: null } as MatSliderChange;
        component.setOpacity(event, ColorType.PRIMARY);
        expect(event.value).toEqual(null);
    });

    it('should select primary color from history on leftClick', () => {
        component.chooseColorFromHistory(leftClick, mainColor);
        expect(colorServiceSpy.primaryColor).toBe(mainColor);
        expect(colorServiceSpy.setOpacity).toHaveBeenCalled();
    });

    it('should select primary color from history on leftClick', () => {
        component.chooseColorFromHistory(middleClick, mainColor);
        expect(colorServiceSpy.primaryColor).not.toBe(mainColor);
    });

    it('should select secondary color from history on leftClick', () => {
        component.chooseColorFromHistory(rightClick, mainColor);
        expect(colorServiceSpy.secondaryColor).toBe(mainColor);
        expect(colorServiceSpy.setOpacity).toHaveBeenCalled();
    });

    it('swap colors should swap primary and secondary colors', () => {
        component.primaryColor = mainColor;
        component.secondaryColor = secondaryColor;
        component.invertColors();
        expect(component.secondaryColor).toEqual(mainColor);
        expect(component.primaryColor).toEqual(secondaryColor);
    });
});
