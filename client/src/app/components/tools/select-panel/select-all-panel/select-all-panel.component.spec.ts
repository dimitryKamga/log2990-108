import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToolManagementService } from '@app/services/tool-management/tool-management.service';
import { SelectRectangleService } from '@app/services/tools/selection/select-rectangle/select-rectangle.service';
import { SelectAllPanelComponent } from './select-all-panel.component';

describe('SelectAllPanelComponent', () => {
    let component: SelectAllPanelComponent;
    let fixture: ComponentFixture<SelectAllPanelComponent>;
    let selectRectangleServiceSpy: jasmine.SpyObj<SelectRectangleService>;
    let toolManagementServiceSpy: jasmine.SpyObj<ToolManagementService>;
    let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;
    let matdialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async(() => {
        matdialogSpy = jasmine.createSpyObj('dialog', ['open']);
        toolManagementServiceSpy = jasmine.createSpyObj('ToolManagementService', ['resetTools']);
        changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
        selectRectangleServiceSpy = jasmine.createSpyObj('SelectRectangleService', ['isSelecAll', 'selectAll']);

        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [SelectAllPanelComponent],
            imports: [BrowserAnimationsModule, MatDialogModule],
            providers: [
                { provide: ToolManagementService, useValue: toolManagementServiceSpy },
                { provide: SelectRectangleService, useValue: selectRectangleServiceSpy },
                { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
                { provide: MatDialog, useValue: matdialogSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectAllPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('shoul select all if isPressed', () => {
        component.isPressed = true;
        component.selectAll();
        expect(selectRectangleServiceSpy.selectAll).toHaveBeenCalled();
    });

    it('shoul reset if !isPressed', () => {
        component.selectAll();
        component.isPressed = false;
        expect(toolManagementServiceSpy.resetTools).toHaveBeenCalled();
    });
});
