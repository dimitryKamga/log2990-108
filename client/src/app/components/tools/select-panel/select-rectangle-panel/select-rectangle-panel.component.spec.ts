import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectRectanglePanelComponent } from './select-rectangle-panel.component';

describe('SelectRectanglePanelComponent', () => {
    let component: SelectRectanglePanelComponent;
    let fixture: ComponentFixture<SelectRectanglePanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectRectanglePanelComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectRectanglePanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
