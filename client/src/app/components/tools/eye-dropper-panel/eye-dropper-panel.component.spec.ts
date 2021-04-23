import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { EyedropperPanelComponent } from './eye-dropper-panel.component';

// tslint:disable: no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('EyedropperPanelComponent', () => {
    let component: EyedropperPanelComponent;
    let fixture: ComponentFixture<EyedropperPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatCardModule],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [EyedropperPanelComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EyedropperPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getVisualisationPanelStatut() and the return value should be eyedropperService.showVisualisationPanel', () => {
        component['eyedropperService'].showVisualisationPanel = true;
        const showVisualisationPanel = component['eyedropperService'].showVisualisationPanel;
        const verify = component.getVisualisationPanelStatut();
        expect(verify).toBe(showVisualisationPanel);
    });
});
