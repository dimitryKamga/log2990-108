import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EllipseAttributes } from '@app/classes/interfaces/shapes-attributes';
import { EllipseService } from '@app/services/tools/shape/ellipse/ellipse.service';
import { EllipsePanelComponent } from './ellipse-panel.component';

describe('EllipsePanelComponent', () => {
    let component: EllipsePanelComponent;
    let fixture: ComponentFixture<EllipsePanelComponent>;
    let ellipseServiceSpy: jasmine.SpyObj<EllipseService>;
    let ellipseAttributes: EllipseAttributes;

    beforeEach(async(() => {
        ellipseServiceSpy = jasmine.createSpyObj('EllipseService', ['setThickness', 'setStyle']);
        TestBed.configureTestingModule({
            declarations: [EllipsePanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: EllipseService, useValue: ellipseServiceSpy }, FormBuilder],
        }).compileComponents();

        ellipseAttributes = {
            name: 'ellipse',
            initialPoint: { x: 0, y: 0 },
            finalPoint: { x: 0, y: 0 },
            center: { x: 0, y: 0 },
            radius: { x: 0, y: 0 },
            circleCenter: { x: 0, y: 0 },
            circleRadius: { x: 0, y: 0 },
            mainColor: 'pink',
            secondaryColor: 'black',
            thickness: 1,
            isShiftDown: false,
            style: 0,
            numberOfSides: 0,
        };
        ellipseServiceSpy.ellipseAttributes = ellipseAttributes;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EllipsePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set thickness', () => {
        component.setThickness(1);
        expect(ellipseServiceSpy.setThickness).toHaveBeenCalled();
    });
    it('should set style', () => {
        component.setStyle(1);
        expect(ellipseServiceSpy.setStyle).toHaveBeenCalled();
    });
});
