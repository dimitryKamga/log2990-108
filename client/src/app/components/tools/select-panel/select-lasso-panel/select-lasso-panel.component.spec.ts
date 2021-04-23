import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectLassoPanelComponent } from './select-lasso-panel.component';

describe('SelectLassoPanelComponent', () => {
    let component: SelectLassoPanelComponent;
    let fixture: ComponentFixture<SelectLassoPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectLassoPanelComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectLassoPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
