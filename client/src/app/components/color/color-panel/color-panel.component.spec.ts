import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorPanelComponent } from './color-panel.component';

describe('ColorPanelComponent', () => {
    let component: ColorPanelComponent;
    let fixture: ComponentFixture<ColorPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPanelComponent],
            imports: [BrowserAnimationsModule, HttpClientModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
