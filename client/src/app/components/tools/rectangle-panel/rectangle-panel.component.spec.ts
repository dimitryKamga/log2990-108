import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RectangleAttributes } from '@app/classes/interfaces/shapes-attributes';
import { RectangleService } from '@app/services/tools/shape/rectangle/rectangle.service';
import { RectanglePanelComponent } from './rectangle-panel.component';

describe('RectanglePanelComponent', () => {
    let component: RectanglePanelComponent;
    let fixture: ComponentFixture<RectanglePanelComponent>;
    let rectangleServiceSpy: jasmine.SpyObj<RectangleService>;
    let rectangleAttributes: RectangleAttributes;

    beforeEach(async(() => {
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', ['setThickness', 'setStyle']);
        TestBed.configureTestingModule({
            declarations: [RectanglePanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: RectangleService, useValue: rectangleServiceSpy }, FormBuilder],
        }).compileComponents();
        rectangleAttributes = {
            name: 'rectangle',
            initialPoint: { x: 0, y: 0 },
            finalPoint: { x: 0, y: 0 },
            width: 0,
            height: 0,
            mainColor: 'pink',
            secondaryColor: 'black',
            thickness: 1,
            isShiftDown: false,
            style: 0,
            numberOfSides: 0,
        };

        rectangleServiceSpy.rectangleAttributes = rectangleAttributes;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RectanglePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set thickness', () => {
        component.setThickness(1);
        expect(rectangleServiceSpy.setThickness).toHaveBeenCalled();
    });
    it('should set style', () => {
        component.setStyle(1);
        expect(rectangleServiceSpy.setStyle).toHaveBeenCalled();
    });
});
