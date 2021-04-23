import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { ExportComponent } from '@app/components/modals/export/export.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;
    let exportComponentSpy: ExportComponent;

    beforeEach(async(() => {
        exportComponentSpy = jasmine.createSpyObj('ExportComponent', ['exportConfirmation', 'resetSubscribers']);
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, RouterTestingModule, MatDialogModule, MatSnackBarModule],
            declarations: [EditorComponent, DrawingComponent, SidebarComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: ExportComponent, useValue: exportComponentSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
