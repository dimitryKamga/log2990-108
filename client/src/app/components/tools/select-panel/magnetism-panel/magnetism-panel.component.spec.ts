import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MagnetismPanelComponent } from './magnetism-panel.component';

describe('MagnetComponent', () => {
    let component: MagnetismPanelComponent;
    let fixture: ComponentFixture<MagnetismPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MagnetismPanelComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MagnetismPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call magnetServiceSpy', () => {
        const magnetServiceSpy = spyOn(component.magnetService, 'enableMagnet').and.callThrough();
        component.isEnabled = false;
        const event = { checked: true } as MatSlideToggleChange;
        component.enableMagnet(event);
        expect(component.isEnabled).toBe(true);
        expect(magnetServiceSpy).toHaveBeenCalled();
    });

    it('#a click on a circle should set the circle', (done: DoneFn) => {
        // tslint:disable-next-line
        const spy = spyOn<any>(component, 'setAnchor');
        // tslint:disable-next-line
        (component['circles'].nativeElement.children.item(0) as HTMLElement).dispatchEvent(new MouseEvent('click', { button: 0 }));
        fixture.whenStable().then(() => {
            expect(spy).toHaveBeenCalled();
            done();
        });
    });
});
