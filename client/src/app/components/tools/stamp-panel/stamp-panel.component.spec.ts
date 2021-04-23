import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { BehaviorSubject, of } from 'rxjs';
import { StampPanelComponent } from './stamp-panel.component';

// tslint:disable: no-empty | raison:  Pour des interfaces a instructions vides

describe('StampPanelComponent', () => {
    let component: StampPanelComponent;
    let fixture: ComponentFixture<StampPanelComponent>;
    let stampServiceSpy: jasmine.SpyObj<StampService>;

    beforeEach(async(() => {
        stampServiceSpy = jasmine.createSpyObj('StampService', [
            'getSize',
            'getAngle',
            'getStampChoice',
            'setSize',
            'setAngle',
            'setStampChoice',
            'stampAttributes',
            'stampForm',
        ]);
        stampServiceSpy.stampAttributes.angle = new BehaviorSubject<number>(1);
        stampServiceSpy.getAngle.and.returnValue(of(0));

        TestBed.configureTestingModule({
            declarations: [StampPanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: StampService, useValue: stampServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        spyOn(component, 'ngOnDestroy').and.callFake(() => {});
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set stamp size', () => {
        const size = 2;
        component.setSize(size);
        expect(stampServiceSpy.setSize).toHaveBeenCalled();
    });

    it('should set stamp choice', () => {
        const choice = {} as MatButtonToggleChange;
        component.setStampChoice(choice);
        expect(stampServiceSpy.setStampChoice).toHaveBeenCalled();
    });

    it('should set stamp angle', () => {
        const angle = 30;
        component.setAngle(angle);
        expect(stampServiceSpy.setAngle).toHaveBeenCalled();
    });
});
