import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShapeStyle } from '@app/classes/enums/draw-enums';
import { PolygonAttributes } from '@app/classes/interfaces/shapes-attributes';
import { PolygonService } from '@app/services/tools/shape/polygon/polygon.service';
import { PolygonPanelComponent } from './polygon-panel.component';

describe('PolygonComponent', () => {
    let component: PolygonPanelComponent;
    let fixture: ComponentFixture<PolygonPanelComponent>;
    let polygonServiceSpy: PolygonService;
    let polygonAttributes: PolygonAttributes;

    beforeEach(async(() => {
        polygonServiceSpy = jasmine.createSpyObj('PolygonService', ['setThickness', 'setStyle', 'setSides']);
        TestBed.configureTestingModule({
            declarations: [PolygonPanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: PolygonService, useValue: polygonServiceSpy }, FormBuilder],
        }).compileComponents();
        polygonAttributes = {
            name: 'polygon',
            initialPoint: { x: 0, y: 0 },
            finalPoint: { x: 0, y: 0 },
            center: { x: 0, y: 0 },
            radius: 0,
            numberOfSides: 3,
            mainColor: 'pink',
            secondaryColor: 'black',
            thickness: 1,
            style: ShapeStyle.BORDER,
        };

        polygonServiceSpy.polygonAttributes = polygonAttributes;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PolygonPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set thickness', () => {
        component.setThickness(1);
        expect(polygonServiceSpy.setThickness).toHaveBeenCalled();
    });

    it('should set style', () => {
        component.setStyle(1);
        expect(polygonServiceSpy.setStyle).toHaveBeenCalled();
    });

    it('should set sides', () => {
        const nbSides = 5;
        component.setSides(nbSides);
        expect(polygonServiceSpy.setSides).toHaveBeenCalled();
    });
});
