import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ResetDrawingService } from '@app/services/drawing/reset-drawing/reset-drawing.service';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    let confirmationDialogServiceSpy: jasmine.SpyObj<ResetDrawingService>;

    beforeEach(async(() => {
        confirmationDialogServiceSpy = jasmine.createSpyObj('DrawingService', ['resetDrawing']);

        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ResetDrawingService, useValue: confirmationDialogServiceSpy },
                { provide: MatDialogRef, useValue: {} },
            ],
            declarations: [ConfirmationDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call correctly a new drawing', () => {
        component.resetDrawing(true);
        expect(confirmationDialogServiceSpy.resetDrawing).toHaveBeenCalled();
    });
});
