import { inject, TestBed } from '@angular/core/testing';
import { ShortcutsHandlerService } from './shortcuts-handler.service';

// tslint:disable:no-string-literal | raison : On voudrait acceder aux attributs privés par la notation de bracket
describe('ShortcutsHandlerService', () => {
    let service: ShortcutsHandlerService;
    let event: KeyboardEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ShortcutsHandlerService],
        });
        service = TestBed.inject(ShortcutsHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should ...', inject([ShortcutsHandlerService], (shortcutsHandlerService: ShortcutsHandlerService) => {
        expect(shortcutsHandlerService).toBeTruthy();
    }));

    it('should return toolLabel.asObservable', () => {
        expect(service.getShortcut()).toEqual(service['toolLabel'].asObservable());
    });

    it('should switch toolLabel on a valid keyboard event', () => {
        event = new KeyboardEvent('keydown', { key: 'a' });
        const keyboardEventSpy = spyOn(service['toolLabel'], 'next');
        service.onKeyDown(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });

    it('should switch toolLabel on a keyboard event with ctrl', () => {
        event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
        const keyboardEventSpy = spyOn(service['toolLabel'], 'next');
        service.onKeyDown(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });

    it('should switch toolLabel on a keyboard event with shift', () => {
        event = new KeyboardEvent('keydown', { key: 's', shiftKey: true });
        const keyboardEventSpy = spyOn(service['toolLabel'], 'next');
        service.onKeyDown(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });

    it('should switch toolLabel on a keyboard event  without ctrl', () => {
        event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, shiftKey: true });
        const keyboardEventSpy = spyOn(service['toolLabel'], 'next');
        service.onKeyDown(event);
        expect(keyboardEventSpy).not.toHaveBeenCalled();
    });

    it('should switch toolLabel on a keyboard event  with shift', () => {
        event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: false, shiftKey: true });
        const keyboardEventSpy = spyOn(service['toolLabel'], 'next');
        service.onKeyDown(event);
        expect(keyboardEventSpy).not.toHaveBeenCalled();
    });

    it('should  not switch toolLabel on a keyboard event  if service is disabled', () => {
        service.isShortcutKeyEnabled = false;
        event = new KeyboardEvent('keydown', { key: 'w' });
        const keyboardEventSpy = spyOn(service['toolLabel'], 'next');
        service.onKeyDown(event);
        expect(keyboardEventSpy).not.toHaveBeenCalled();
    });

    it('should  not switch toolLabel on a keyboard event if it is not a shortcut', () => {
        event = new KeyboardEvent('keydown', { key: '.' });
        const keyboardEventSpy = spyOn(service['toolLabel'], 'next');
        service.onKeyDown(event);
        expect(keyboardEventSpy).not.toHaveBeenCalled();
    });

    it('should not switch toolLabel on a keyboard using Ctrl ig it is not pressed', () => {
        event = new KeyboardEvent('keydown', { key: 'o', ctrlKey: false });
        const keyboardEventSpy = spyOn(service['toolLabel'], 'next');
        service.onKeyDown(event);
        expect(keyboardEventSpy).not.toHaveBeenCalled();
    });
});
