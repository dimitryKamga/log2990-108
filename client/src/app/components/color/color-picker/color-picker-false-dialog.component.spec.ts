import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ColorType } from '@app/classes/enums/draw-enums';
import { ColorService } from '@app/services/color/color.service';
import { ColorPickerComponent } from './color-picker.component';

import SpyObj = jasmine.SpyObj;

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    let colorServiceSpy: SpyObj<ColorService>;
    const secondaryColor = 'white';
    const primaryColor = 'black';

    beforeEach(async(() => {
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['setPrimaryColor', 'setSecondaryColor']);
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
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not set secondary color if dialog is closed', () => {
        component.selectColor(secondaryColor, ColorType.SECONDARY);
        expect(colorServiceSpy.setSecondaryColor).toHaveBeenCalled();
    });
    it('should not set primary color if dialog is closed', () => {
        component.selectColor(primaryColor, ColorType.PRIMARY);
        expect(colorServiceSpy.setPrimaryColor).toHaveBeenCalled();
    });
});
