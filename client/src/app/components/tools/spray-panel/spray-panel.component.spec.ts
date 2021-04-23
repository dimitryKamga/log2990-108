import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TOOL_LABELS } from '@app/classes/constants/toolbar-constants';
import { SprayAttributes } from '@app/classes/interfaces/tools-attributes';
import { SprayService } from '@app/services/tools/spray/spray.service';
import { SprayPanelComponent } from './spray-panel.component';

describe('SprayPanelComponent', () => {
    let component: SprayPanelComponent;
    let fixture: ComponentFixture<SprayPanelComponent>;
    let sprayServiceSpy: jasmine.SpyObj<SprayService>;
    let sprayAttributes: SprayAttributes;

    beforeEach(async(() => {
        sprayServiceSpy = jasmine.createSpyObj('SprayAttributes', ['sprayAttributes', 'setJetDiameter', 'setDropletDiameter', 'setFrequency']);

        TestBed.configureTestingModule({
            declarations: [SprayPanelComponent],
            imports: [ReactiveFormsModule, FormsModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: SprayService, useValue: sprayServiceSpy }, FormBuilder],
        }).compileComponents();

        sprayAttributes = {
            name: TOOL_LABELS.SPRAY,
            mainColor: '',
            secondaryColor: '',
            thickness: 1,
            jetDiameter: 1,
            pathData: { x: 0, y: 0 },
            dropletDiameter: 1,
            frequency: 1,
            imageData: sprayServiceSpy.canvasImageData,
        };
        sprayServiceSpy.sprayAttributes = sprayAttributes;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SprayPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call set jet diameter', () => {
        const jetDiameter = 1;
        component.setJetDiameter(jetDiameter);
        expect(sprayServiceSpy.setJetDiameter).toHaveBeenCalled();
    });

    it('should call droplet diameter', () => {
        const dropletDiameter = 1;
        component.setDropletDiameter(dropletDiameter);
        expect(sprayServiceSpy.setDropletDiameter).toHaveBeenCalled();
    });

    it('should call set frequency', () => {
        const frequency = 1;
        component.setFrequency(frequency);
        expect(sprayServiceSpy.setFrequency).toHaveBeenCalled();
    });
});
