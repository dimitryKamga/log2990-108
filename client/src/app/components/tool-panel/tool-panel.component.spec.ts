import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToolPanelComponent } from '@app/components/tool-panel/tool-panel.component';

describe('ToolPanelComponent', () => {
    let component: ToolPanelComponent;
    let fixture: ComponentFixture<ToolPanelComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, MatSnackBarModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ToolPanelComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
