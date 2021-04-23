import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShortcutsHandlerService } from '@app/services/shortcuts-handler/shortcuts-handler.service';
import { TextLogicService } from '@app/services/tools/text/text-logic.service';
import { TextService } from '@app/services/tools/text/text.service';
import { TextPanelComponent } from './text-panel.component';

describe('TextPanelComponent', () => {
    let component: TextPanelComponent;
    let fixture: ComponentFixture<TextPanelComponent>;
    let textLogicServiceSpy: jasmine.SpyObj<TextLogicService>;
    let textServiceSpy: jasmine.SpyObj<TextService>;
    let shortcutServiceSpy: jasmine.SpyObj<ShortcutsHandlerService>;

    beforeEach(async(() => {
        textLogicServiceSpy = jasmine.createSpyObj('TextLogicService', [
            'setFontStyle',
            'setAlignment',
            'setItalic',
            'setSize',
            'setBold',
            'generateText',
        ]);
        textServiceSpy = jasmine.createSpyObj('TextService', ['getLinePositionAndIndex']);
        shortcutServiceSpy = jasmine.createSpyObj('ShortcutHandlerService', ['onKeyDown']);

        TestBed.configureTestingModule({
            declarations: [TextPanelComponent],
            imports: [ReactiveFormsModule, MatButtonToggleModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                FormBuilder,
                { provide: TextLogicService, useValue: textLogicServiceSpy },
                { provide: TextService, useValue: textServiceSpy },
                { provide: ShortcutsHandlerService, useValue: shortcutServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change font', () => {
        component.changeFont('Georgia');
        expect(textLogicServiceSpy.setFontStyle).toHaveBeenCalled();
    });
    it('should set in Italic', () => {
        component.setItalic(true);
        expect(textLogicServiceSpy.setItalic).toHaveBeenCalled();
    });

    it('should change size', () => {
        component.changeSize(1);
        expect(textLogicServiceSpy.setSize).toHaveBeenCalled();
    });

    it('should set in Bold', () => {
        component.setBold(true);
        expect(textLogicServiceSpy.setBold).toHaveBeenCalled();
    });

    it('should set alignment', () => {
        component.setAlignment('center');
        expect(textLogicServiceSpy.setAlignment).toHaveBeenCalled();
    });

    it('should deactivate shortcuts and writing', () => {
        component.onWriting();
        expect(shortcutServiceSpy.isShortcutKeyEnabled).toBeFalse();
        expect(textServiceSpy.canWrite).toBeFalse();
    });

    it('should deactivate shortcuts and writing', () => {
        component.onConfirm();
        expect(textServiceSpy.canWrite).toBeTrue();
    });

    it('should stop windows event with on key down', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        const propagation = spyOn(event, 'stopPropagation');
        component.onKeyDown(event);
        expect(propagation).toHaveBeenCalled();
    });

    it('should not stop windows event with on key down', () => {
        const event = new KeyboardEvent('keydown', { key: '+' });
        const propagation = spyOn(event, 'stopPropagation');
        component.onKeyDown(event);
        expect(propagation).not.toHaveBeenCalled();
    });
});
