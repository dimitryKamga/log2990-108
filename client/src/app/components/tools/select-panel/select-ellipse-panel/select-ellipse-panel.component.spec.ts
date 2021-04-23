import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectEllipsePanelComponent } from './select-ellipse-panel.component';

describe('SelectEllipsePanelComponent', () => {
    let component: SelectEllipsePanelComponent;
    let fixture: ComponentFixture<SelectEllipsePanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectEllipsePanelComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectEllipsePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
