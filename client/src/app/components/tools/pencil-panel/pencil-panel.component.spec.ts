import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { PencilAttributes } from '@app/classes/interfaces/tools-attributes';
import { PencilPanelComponent } from '@app/components/tools/pencil-panel/pencil-panel.component';
import { PencilService } from '@app/services/tools/pencil/pencil.service';

describe('PencilAttributesComponent', () => {
    let component: PencilPanelComponent;
    let fixture: ComponentFixture<PencilPanelComponent>;
    let pencilServiceSpy: jasmine.SpyObj<PencilService>;
    let pencilAttributes: PencilAttributes;

    beforeEach(async(() => {
        pencilServiceSpy = jasmine.createSpyObj('PencilService', ['setThickness']);
        TestBed.configureTestingModule({
            declarations: [PencilPanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: PencilService, useValue: pencilServiceSpy }, FormBuilder],
        }).compileComponents();
        pencilAttributes = {
            name: TOOL_LABELS.PENCIL,
            pathData: [],
            mainColor: '',
            thickness: 1,
            secondaryColor: '',
        };
        pencilServiceSpy.pencilAttributes = pencilAttributes;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PencilPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('thickness should be updated when setThickness is called', () => {
        const thickness = 1;
        component.setThickness(thickness);
        expect(pencilServiceSpy.setThickness).toHaveBeenCalled();
    });
});
