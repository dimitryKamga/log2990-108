import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { EraserAttributes } from '@app/classes/interfaces/tools-attributes';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { EraserPanelComponent } from './eraser-panel.component';

describe('EraserPanelComponent', () => {
    let component: EraserPanelComponent;
    let fixture: ComponentFixture<EraserPanelComponent>;
    let eraserServiceSpy: jasmine.SpyObj<EraserService>;
    let eraserAttributes: EraserAttributes;

    beforeEach(async(() => {
        eraserServiceSpy = jasmine.createSpyObj('EraserService', ['setThickness']);
        TestBed.configureTestingModule({
            declarations: [EraserPanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: EraserService, useValue: eraserServiceSpy }, FormBuilder],
        }).compileComponents();
        eraserAttributes = {
            name: TOOL_LABELS.ERASER,
            pathData: [],
            mainColor: '',
            thickness: 1,
            secondaryColor: '',
        };
        eraserServiceSpy.eraserAttributes = eraserAttributes;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EraserPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('thickness should be updated when setThickness is called', () => {
        const thickness = 1;
        component.setThickness(thickness);
        expect(eraserServiceSpy.setThickness).toHaveBeenCalled();
    });
});
