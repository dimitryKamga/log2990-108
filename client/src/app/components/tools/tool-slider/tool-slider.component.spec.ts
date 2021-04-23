import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { ToolSliderComponent } from './tool-slider.component';

describe('ToolSliderComponent', () => {
    let component: ToolSliderComponent;
    let fixture: ComponentFixture<ToolSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ToolSliderComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#should change the value onValueChange', () => {
        const slideEvent = new MatSliderChange();
        slideEvent.value = 1;
        component.valueChange.subscribe((value: number) => (component.value = value));
        component.onValueChange(slideEvent);
        expect(component.value).toEqual(1);
    });
});
