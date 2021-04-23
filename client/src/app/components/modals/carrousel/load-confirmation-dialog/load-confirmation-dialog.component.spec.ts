import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { LoadConfirmationDialogComponent } from './load-confirmation-dialog.component';

describe('LoadConfirmationDialogComponent', () => {
    let component: LoadConfirmationDialogComponent;
    let fixture: ComponentFixture<LoadConfirmationDialogComponent>;
    let shortcutsHandlerServiceSpy: ShortcutsHandlerService;
    let dialogRefSpy: MatDialogRef<LoadConfirmationDialogComponent>;

    beforeEach(async(() => {
        shortcutsHandlerServiceSpy = jasmine.createSpyObj('ShortcutHandlerService', ['isShortcutKeyEnabled']);
        dialogRefSpy = jasmine.createSpyObj('dialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [LoadConfirmationDialogComponent],
            providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
            imports: [BrowserAnimationsModule, MatDialogModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoadConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' on destroy should enable shortcuts ', () => {
        component.ngOnDestroy();
        expect(shortcutsHandlerServiceSpy.isShortcutKeyEnabled).toBeTruthy();
    });

    it('drawImage should close mat dialogref', () => {
        component.drawImage();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
