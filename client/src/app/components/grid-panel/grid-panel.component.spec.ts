import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GridService } from '@app/services/grid/grid.service';
import { GridPanelComponent } from './grid-panel.component';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket

describe('GridComponent', () => {
    let component: GridPanelComponent;
    let fixture: ComponentFixture<GridPanelComponent>;

    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(async(() => {
        gridServiceSpy = jasmine.createSpyObj(
            'GridService',
            ['clearGridCanvas', 'setGrid', 'gridHandler', 'keyboardHandler', 'changeSquareSize', 'changeOpacity', 'setGridEnabler'],
            ['gridCtx, gridCanvas'],
        );
        TestBed.configureTestingModule({
            declarations: [GridPanelComponent],
            imports: [ReactiveFormsModule, MatSlideToggleModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [FormBuilder, { provide: GridService, useValue: gridServiceSpy }],
        }).compileComponents();

        gridServiceSpy.gridCanvas = new CanvasTestHelper().canvas;
        gridServiceSpy.gridCtx = new CanvasTestHelper().canvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set gridEnabler', () => {
        component['activeToggleRef'] = ({ checked: true } as unknown) as MatSlideToggle;
        component.setGridEnabler();
        expect(gridServiceSpy.isEnabled).toBeTrue();
    });

    it('should set opacity', () => {
        const value = 43;
        component['activeToggleRef'] = ({ checked: true } as unknown) as MatSlideToggle;
        component.setOpacity(value);
        expect(gridServiceSpy.changeOpacity).toHaveBeenCalled();
    });

    it('should set squaresize', () => {
        const value = 43;
        component['activeToggleRef'] = ({ checked: true } as unknown) as MatSlideToggle;
        component.setSquaresize(value);
        expect(gridServiceSpy.changeSquareSize).toHaveBeenCalled();
    });

    it(' should contain key event', () => {
        component['activeToggleRef'] = ({ checked: true } as unknown) as MatSlideToggle;
        component.gridService.isEnabled = true;
        const event = new KeyboardEvent('keydown', { key: '+' });
        component.onKeyDown(event);
        expect(gridServiceSpy.keyboardHandler).toHaveBeenCalled();
    });

    it(' should NOT call keyboard handler', () => {
        component['activeToggleRef'] = ({ checked: true } as unknown) as MatSlideToggle;
        component.gridService.isEnabled = false;
        const event = new KeyboardEvent('keydown', { key: '+' });
        component.onKeyDown(event);
        expect(gridServiceSpy.keyboardHandler).not.toHaveBeenCalled();
    });
});
