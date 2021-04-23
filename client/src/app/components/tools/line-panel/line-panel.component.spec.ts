import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LineAttributes } from '@app/classes/interfaces/tools-attributes';
import { LineService } from '@app/services/tools/line/line.service';
import { LinePanelComponent } from './line-panel.component';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
// tslint:disable: no-any | raison:  Pour pouvoir faire des spy sur les membres privés

describe('LinePanelComponent', () => {
    let component: LinePanelComponent;
    let fixture: ComponentFixture<LinePanelComponent>;
    let lineServiceSpy: jasmine.SpyObj<LineService>;
    let lineAttributes: LineAttributes;

    beforeEach(async(() => {
        lineAttributes = {
            name: 'line',
            segment: { firstPoint: { x: 9, y: 7 }, lastPoint: { x: 6, y: 0 } },
            mainColor: 'black',
            secondaryColor: 'black',
            mouseClicks: [],
            isJunction: true,
            endLine: 'round',
            thickness: 1,
            isDoubleClicked: true,
            isLastPoint: false,
            savedSegment: [{ firstPoint: { x: 1, y: 0 }, lastPoint: { x: 2, y: 0 } }],
            dotRadius: 5,
        };
        lineServiceSpy = jasmine.createSpyObj('LineService', ['updateThickness', 'updateDotRadius', 'updateJunction']);
        TestBed.configureTestingModule({
            declarations: [LinePanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: LineService, useValue: lineServiceSpy }, FormBuilder],
        }).compileComponents();
        lineServiceSpy.lineAttributes = lineAttributes;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LinePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set dot radius', () => {
        component.setDotRadius(1);
        expect(lineServiceSpy.updateDotRadius).toHaveBeenCalled();
    });

    it('should set thickness', () => {
        component.setThickness(1);
        expect(lineServiceSpy.updateThickness).toHaveBeenCalled();
    });

    it('should set thickness to 1 if a negative value is wanted', () => {
        const negativeValue = -1;
        component.setThickness(negativeValue);
        expect(component.thickness).toEqual(1);
    });

    it('should change onChangeJonctionOption', () => {
        component.isJunction = true;
        component.onChangeJonctionOption(new MatSlideToggleChange(component['slideToggle'], false));
        expect(component.isJunction).toBeFalsy();
    });
});
